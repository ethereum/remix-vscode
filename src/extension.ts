'use strict';

import * as vscode from 'vscode';
import { Uri } from 'vscode';

import { RmxPluginsProvider } from './rmxPlugins';

export function activate(context: vscode.ExtensionContext) {
	// Samples of `window.registerTreeDataProvider`
	const rmxPluginsProvider = new RmxPluginsProvider(vscode.workspace.rootPath);
	vscode.window.registerTreeDataProvider('rmxPlugins', rmxPluginsProvider);
	// vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
	// vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
	vscode.commands.registerCommand('extension.activateRmxPlugin', pluginName => RemixPanel.createOrShow(pluginName))
}
class RemixPanel {
	public static currentPanel: RemixPanel | undefined;
	private static readonly viewType = "Remix Plugin";
	private readonly panel: vscode.WebviewPanel;
	private disposables: vscode.Disposable[] = [];

	private constructor(column: vscode.ViewColumn) {
		this.panel = vscode.window.createWebviewPanel(RemixPanel.viewType, "Remix IDE", column, {
			enableScripts: true,
			localResourceRoots: [Uri.parse("https://remix-control-flow-gas.surge.sh")]
		});
		// Set the webview's initial html content
		this.panel.webview.html = this.getHtmlForWebview();
		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
	}
	public dispose() {
		RemixPanel.currentPanel = undefined;

		// Clean up our resources
		this.panel.dispose();

		while (this.disposables.length) {
		  const x = this.disposables.pop();
		  if (x) {
			x.dispose();
		  }
		}
	}
	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor ? -2 : undefined;

		// If we already have a panel, show it.
		// Otherwise, create a new panel.
		if (RemixPanel.currentPanel) {
		  try {
			RemixPanel.currentPanel.panel.reveal(column);
		  } catch (error) {
			console.error(error);
		  }
		} else {
		  try {
			RemixPanel.currentPanel = new RemixPanel(column || vscode.ViewColumn.One);
		  } catch (error) {
			console.error(error);
		  }
		}
	  }
	private getHtmlForWebview() {
		return `<!DOCTYPE html>
		  <html lang="en">
		  <head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
			<meta name="theme-color" content="#000000">
			<title>Remix IDE</title>
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:;style-src vscode-resource: 'unsafe-inline' http: https: data:;">
		  </head>
		  <body>
			<noscript>You need to enable JavaScript to run this app.</noscript>
			<div id="root">
				<h1>Welcome to Remix IDE</h1>
			</div>
		  </body>
		  </html>`;
	  }
}