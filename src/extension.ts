"use strict";

import * as vscode from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { WebviewPlugin } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import { pluginActivate, pluginDeactivate } from './optionInputs';
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo } from "./types";

export async function activate(context: vscode.ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
  vscode.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  vscode.commands.registerCommand("extension.activateRmxPlugin", (pluginId) => {
    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      console.log("Engine loaded");
      // Load mock solidity plugin
      const solpl = new NativeSolcPlugin();
      engine.register(solpl);
      // TODO: load mock fileManager & editor plugin
      // Load supplied plugin id
      // Get plugininfo from plugin array
      const pluginData: PluginInfo = GetPluginData(pluginId);
      // choose window column for display
      const cl = ToViewColumn(pluginData);
      const plugin = new WebviewPlugin(pluginData, { context, column: cl });
      engine.register(plugin);
      manager.activatePlugin([pluginId, 'solidity']).then(async () => {
        const profile = await manager.getProfile(pluginId);
        vscode.window.showInformationMessage(`${profile.displayName} v${profile.version} activated.`);
        setTimeout(() => {
          solpl.compile();
        }, 5000);
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
