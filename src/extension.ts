'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { PluginManager, Engine } from '@remixproject/engine';

import { RmxPluginsProvider } from './rmxPlugins';

const manager = new PluginManager();

export function activate(context: vscode.ExtensionContext) {
	const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('rmxPlugins', rmxPluginsProvider);
	// vscode.commands.registerCommand('extension.activateRmxPlugin', pluginName => RemixPanel.createOrShow(pluginName));
	vscode.commands.registerCommand('extension.activateRmxPlugin', pluginName => {
		console.log("activating plugin ", pluginName);
		const engine = new Engine(manager);
		engine.onload(() => {
			console.log("Engine loaded");
			engine.register(pluginName);
		});
	});
}