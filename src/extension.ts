"use strict";

import * as vscode from "vscode";
import { Uri } from "vscode";
import { PluginManager, Engine } from "@remixproject/engine";

import { RmxPluginsProvider } from "./rmxPlugins";
import NativePlugin from "./plugins/nativeplugin";
import IframePlugin from "./plugins/iframeplugin";

export function activate(context: vscode.ExtensionContext) {
  const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
  vscode.window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);
  vscode.commands.registerCommand("extension.activateRmxPlugin", (pluginId) => {
    console.log("activating plugin ", pluginId);

    const manager = new PluginManager();
    const engine = new Engine(manager);
    let plugin = null;
    console.log("Engine loaded");
    switch (pluginId) {
      case "native-plugin":
        plugin = new NativePlugin();
        break;
      case "iframe-plugin":
        plugin = new IframePlugin();
        break;
    }

    engine.onload(() => {
      engine.register(plugin);
      manager.activatePlugin(pluginId).then(() => {
        manager.call(pluginId, "getVersion").then((v) => {
          vscode.window.showInformationMessage(`${pluginId} v${v} activated.`);
        });
      });
    });
  });
}
