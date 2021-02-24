"use strict";
import { window, commands, workspace, InputBoxOptions, ExtensionContext, QuickPickItem } from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { ThemeUrls} from '@remixproject/plugin-api'
import { VscodeAppManager, WebviewPlugin, ThemePlugin, FileManagerPlugin, EditorPlugin, EditorOptions, transformCmd, ThemeOptions, ContentImportPlugin } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import { pluginActivate, pluginDeactivate, pluginUninstall } from './optionInputs';
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo, CompilerInputOptions } from "./types";
import { Profile } from '@remixproject/plugin-utils';

class VscodeManager extends VscodeAppManager {
  onActivation() {
    console.log('manager activated');
  }
}

export async function activate(context: ExtensionContext) {
  let selectedVersion: string = 'latest';
  let compilerOpts: CompilerInputOptions = {
    language: "Solidity",
    optimize: false,
    runs: 200
  };
  const rmxPluginsProvider = new RmxPluginsProvider(workspace.workspaceFolders[0].uri.fsPath);
  const editoropt: EditorOptions = { language: 'solidity', transformCmd };
  const engine = new Engine();
  const manager = new VscodeManager();
  const solpl = new NativeSolcPlugin();
  const filemanager = new FileManagerPlugin();
  const editorPlugin = new EditorPlugin(editoropt);
  const importer = new ContentImportPlugin();
  const themeURLs: Partial<ThemeUrls> = {
    light: 'https://remix-alpha.ethereum.org/assets/css/themes/remix-light_powaqg.css',
    dark: 'https://remix-alpha.ethereum.org/assets/css/themes/remix-dark_tvx1s2.css'
  };
  const themeOpts: ThemeOptions = { urls: themeURLs };
  const theme = new ThemePlugin(themeOpts);
  engine.register([manager, solpl, filemanager, editorPlugin, theme, importer]);
  window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);

  // fetch default data from the plugins-directory filtered by engine
  const defaultPluginData = await manager.registeredPluginData()
  rmxPluginsProvider.setDefaultData(defaultPluginData)
  
  // compile
  commands.registerCommand("rmxPlugins.compile", async () => {
    await manager.activatePlugin(['solidity', 'fileManager', 'editor', 'contentImport']);
    solpl.compile(selectedVersion, compilerOpts);
  });
  // activate plugin
  commands.registerCommand("extension.activateRmxPlugin", async (pluginId: string) => {
    // Get plugininfo from plugin array
    const pluginData: PluginInfo = GetPluginData(pluginId, defaultPluginData);
    
    // choose window column for display
    const cl = ToViewColumn(pluginData);
    const plugin = new WebviewPlugin(pluginData, { context, column: cl });
    if (!engine.isRegistered(pluginId)) {
      engine.register(plugin);
    }

    manager.activatePlugin([pluginId, 'solidity', 'fileManager', 'editor']);
    const profile: Profile = await manager.getProfile(pluginId);
    window.showInformationMessage(`${profile.displayName} v${profile.version} activated.`);
  });
  commands.registerCommand('rmxPlugins.refreshEntry', () => {
      console.log('Remix Plugin will refresh plugin list.')
      rmxPluginsProvider.refresh()
    }
  );
  commands.registerCommand('rmxPlugins.addEntry', () => {
    const pluginjson: PluginInfo = {
      name: "remix-plugin-example",
      displayName: "Remix plugin example",
      methods: [],
      version: "0.0.1-dev",
      url: "",
      description: "Run remix plugin in your Remix project",
      icon: "",
      location: "sidePanel",
    };
    const opts: InputBoxOptions = {
      value: JSON.stringify(pluginjson),
      placeHolder: "Add your plugin JSON"
    };
    window.showInputBox(opts).then((input: string) => {
      if (input && input.length > 0) {
        const devPlugin: PluginInfo = JSON.parse(input);
        rmxPluginsProvider.add(devPlugin);
      }
    });
  }
  );
  commands.registerCommand('rmxPlugins.uninstallRmxPlugin', async (pluginId: string) => {
    commands.executeCommand('extension.deActivateRmxPlugin', pluginId);
    rmxPluginsProvider.remove(pluginId)
  });
  commands.registerCommand('rmxPlugins.showPluginOptions', async (plugin) => {
    let id = '';
    if (plugin instanceof Object)
      id = plugin.id
    else
      id = plugin

    const options: { [key: string]: (context: ExtensionContext, id: string) => Promise<void> } = {
      Activate: pluginActivate,
      Deactivate: pluginDeactivate,
      Uninstall: pluginUninstall,
      // TODO: add following menu options
      // install,
      // uninstall,
      // configure
    };
    const quickPick = window.createQuickPick();
    quickPick.items = Object.keys(options).map(label => ({ label }));
    quickPick.onDidChangeSelection(selection => {
      if (selection[0]) {
        options[selection[0].label](context, id)
          .catch(console.error);
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });
  commands.registerCommand('extension.deActivateRmxPlugin', async (pluginId: string) => {
    manager.deactivatePlugin([pluginId]);
    editorPlugin.discardDecorations();
    console.log(`${pluginId} plugin deactivated!`);
  });
  // Version selector
  commands.registerCommand('rmxPlugins.versionSelector', async () => {
    try {
      await manager.activatePlugin(['solidity']);
      const versions = solpl.getSolidityVersions();
      const opts: Array<QuickPickItem> = Object.keys(versions).map((v): QuickPickItem => {
        const vopt: QuickPickItem = {
          label: v,
          description: `Solidity ${v}`
        };
        return vopt;
      });
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          selectedVersion = selected.label;
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  // Optimizer selector
  commands.registerCommand('rmxPlugins.optimizerSelector', async () => {
    try {
      const opts: Array<QuickPickItem> = [
        {
          label: 'Enable',
          description: 'Enable optimizer',
        },
        {
          label: 'Disable',
          description: 'Disable optimizer',
        },
      ];
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          compilerOpts.optimize = Boolean(selected.label === 'Enable');
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  // Language selector
  commands.registerCommand('rmxPlugins.languageSelector', async () => {
    try {
      const opts: Array<QuickPickItem> = [
        {
          label: 'Solidity',
          description: 'Enable Solidity language',
        },
        {
          label: 'Yul',
          description: 'Enable Yul language',
        },
      ];
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          switch(selected.label) {
            case 'Solidity':
              compilerOpts.language = 'Solidity';
              compilerOpts.optimize = false;
              break;
            case 'Yul':
              compilerOpts.language = 'Yul';
              compilerOpts.optimize = false;
              break;
            default:
              compilerOpts.language = 'Solidity';
          }
        }
      });
    } catch (error) {
      console.log(error);      
    }
  });
}
