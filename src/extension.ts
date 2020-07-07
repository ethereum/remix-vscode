"use strict";

import * as vscode from "vscode";
import { PluginManager, Engine } from '@remixproject/engine';
import { WebviewPlugin } from '@remixproject/engine-vscode';

import { RmxPluginsProvider } from "./rmxPlugins";
import NativePlugin from "./plugins/nativeplugin";
import { pluginActivate, pluginDeactivate } from './optionInputs';
import { PluginData } from "./pluginlist";
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo } from "./types";

export async function activate(context: vscode.ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
  vscode.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  vscode.commands.registerCommand("extension.activateRmxPlugin", (pluginId) => {
    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      let plugin = null;
      console.log("Engine loaded");
      switch (pluginId) {
        case "native-plugin":
          plugin = new NativePlugin();
          break;
        default:
          // Get plugininfo from plugin array
          const pluginData: PluginInfo = GetPluginData(pluginId);
          // choose window column for display
          const cl = ToViewColumn(pluginData);
          plugin = new WebviewPlugin({ name: pluginData.name, url: pluginData.url }, { context, column: cl });
          break;
      }
      engine.register(plugin);
      manager.activatePlugin(pluginId).then(() => {
        manager.call(pluginId, "getVersion").then((v) => {
          vscode.window.showInformationMessage(`${pluginId} v${v} activated.`);
        });
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
