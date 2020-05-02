'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { PluginManager } from '@remixproject/engine';

import { RmxPluginsProvider } from './rmxPlugins';

const manager = new PluginManager({});

export function activate(context: vscode.ExtensionContext) {
	const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('rmxPlugins', rmxPluginsProvider);
	// vscode.commands.registerCommand('extension.activateRmxPlugin', pluginName => RemixPanel.createOrShow(pluginName));
	vscode.commands.registerCommand('extension.activateRmxPlugin', pluginName => {
		manager.activatePlugin([pluginName]);
	});
}