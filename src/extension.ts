"use strict";
import { window, commands, workspace, InputBoxOptions, ExtensionContext } from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { ThemeUrls} from '@remixproject/plugin-api'
import { WebviewPlugin, ThemePlugin, FileManagerPlugin, EditorPlugin, EditorOptions, transformCmd, ThemeOptions } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import { pluginActivate, pluginDeactivate, pluginUninstall } from './optionInputs';
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo } from "./types";
import { Profile } from '@remixproject/plugin-utils';

class VscodeManager extends PluginManager {
  onActivation() {
    console.log('manager activated');
  }
}

export async function activate(context: ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(workspace.workspaceFolders[0].uri.fsPath);
  const editoropt: EditorOptions = { language: 'solidity', transformCmd };
  const engine = new Engine();
  const manager = new VscodeManager();
  const solpl = new NativeSolcPlugin();
  const filemanager = new FileManagerPlugin();
  const editorPlugin = new EditorPlugin(editoropt);
  const themeURLs: Partial<ThemeUrls> = {
    light: 'https://remix-alpha.ethereum.org/assets/css/themes/remix-light_powaqg.css',
    dark: 'https://remix-alpha.ethereum.org/assets/css/themes/remix-dark_tvx1s2.css'
  };
  const themeOpts: ThemeOptions = { urls: themeURLs };
  const theme = new ThemePlugin(themeOpts);
  engine.register([manager, solpl, filemanager, editorPlugin, theme]);
  window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  // compile
  commands.registerCommand("rmxPlugins.compile", async () => {
    await manager.activatePlugin(['solidity', 'fileManager', 'editor']);
    solpl.compile();
  });
  // activate plugin
  commands.registerCommand("extension.activateRmxPlugin", async (pluginId: string) => {
    // Get plugininfo from plugin array
    const pluginData: PluginInfo = GetPluginData(pluginId);
    // choose window column for display
    const cl = ToViewColumn(pluginData);
    const plugin = new WebviewPlugin(pluginData, { context, column: cl },);
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
}
