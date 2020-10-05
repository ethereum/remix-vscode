"use strict";

import * as vscode from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { WebviewPlugin, FileManagerPlugin } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
// import FileManagerPlugin from "./plugins/filemanager";
import EditorPlugin from "./plugins/editorPlugin";
import { pluginActivate, pluginDeactivate } from './optionInputs';
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo } from "./types";
import {Profile} from '@remixproject/plugin-utils';

export async function activate(context: vscode.ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
  const manager = new PluginManager();
  const solpl = new NativeSolcPlugin();
  const engine = new Engine(manager);
  const filemanager = new FileManagerPlugin();
  const editorPlugin = new EditorPlugin();

  vscode.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  vscode.commands.registerCommand("extension.activateRmxPlugin", (pluginId) => {
    // TODO: load mock fileManager & editor plugin
    engine.onload(async () => {
      console.log("Engine loaded");
      // Load mock solidity plugin
      await engine.register(solpl);
      await engine.register(filemanager);
      await engine.register(editorPlugin);
      // Get plugininfo from plugin array
      const pluginData: PluginInfo = GetPluginData(pluginId);
      // choose window column for display
      const cl = ToViewColumn(pluginData);
      const plugin = new WebviewPlugin(pluginData, { context, column: cl });
      engine.register(plugin);
      manager.activatePlugin([pluginId, 'solidity', 'fileManager', 'editor']).then(async () => {
        vscode.commands.registerCommand("rmxPlugins.compile", () => {
          console.log("Will compile");
          solpl.compile();
        });
        const profile: Profile = await manager.getProfile(pluginId);
        vscode.window.showInformationMessage(`${profile.displayName} v${profile.version} activated.`);
      });
    });
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
	})
}
