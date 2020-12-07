"use strict";

import * as vscode from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { WebviewPlugin, ThemePlugin, FileManagerPlugin, EditorPlugin, EditorOptions } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import { pluginActivate, pluginDeactivate } from './optionInputs';
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo } from "./types";
import { Profile } from '@remixproject/plugin-utils';

class VscodeManager extends PluginManager {
  onActivation() {
    console.log('manager activated');
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
  const editoropt: EditorOptions = { language: 'solidity', transformCmd: null };
  const engine = new Engine();
  const manager = new VscodeManager();
  const solpl = new NativeSolcPlugin();
  const filemanager = new FileManagerPlugin();
  const editorPlugin = new EditorPlugin(editoropt);
  const theme = new ThemePlugin();
  engine.register([manager, solpl, filemanager, editorPlugin, theme]);
  vscode.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  // compile
  vscode.commands.registerCommand("rmxPlugins.compile", () => {
    manager.activatePlugin(['solidity', 'fileManager', 'editor']);
    solpl.compile();
  });
  // activate plugin
  vscode.commands.registerCommand("extension.activateRmxPlugin", async (pluginId: string) => {
    // Get plugininfo from plugin array
    const pluginData: PluginInfo = GetPluginData(pluginId);
    // choose window column for display
    const cl = ToViewColumn(pluginData);
    const plugin = new WebviewPlugin(pluginData, { context, column: cl });
    if (!engine.isRegistered(pluginId)) {
      engine.register(plugin);
    }
    manager.activatePlugin([pluginId, 'solidity', 'fileManager', 'editor']);
    const profile: Profile = await manager.getProfile(pluginId);
    vscode.window.showInformationMessage(`${profile.displayName} v${profile.version} activated.`);
  });
  vscode.commands.registerCommand('rmxPlugins.refreshEntry', () =>
    console.log('Remix Plugin will refresh plugin list.')
  );
  vscode.commands.registerCommand('rmxPlugins.addEntry', () =>
    console.log('Remix Plugin will add new plugin to the list.')
  );
  vscode.commands.registerCommand('rmxPlugins.showPluginOptions', async (plugin) => {
    let id = '';
    if (plugin instanceof Object)
      id = plugin.id
    else
      id = plugin

    const options: { [key: string]: (context: vscode.ExtensionContext, id: string) => Promise<void> } = {
      Activate: pluginActivate,
      Deactivate: pluginDeactivate,
      // TODO: add following menu options
      // install,
      // uninstall,
      // configure
    };
    const quickPick = vscode.window.createQuickPick();
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
  vscode.commands.registerCommand('extension.deActivateRmxPlugin', async (pluginId: string) => {
    manager.deactivatePlugin([pluginId]);
    // engine.remove([pluginId]);
    console.log(`${pluginId} plugin deactivated!`);
  });
}
