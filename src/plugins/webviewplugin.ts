import { Plugin } from "@remixproject/engine";
import * as vscode from "vscode";

export default class WebviewPlugin extends Plugin {
  panel: vscode.WebviewPanel;
  constructor() {
    super({ name: "iframe-plugin", methods: ["getVersion"] });
    this.panel = vscode.window.createWebviewPanel(
      "RemixWebviewPluginViewType",
      "RemixWebviewPlugin",
      vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restric the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [],
      }
    );
    this.panel.webview.html = this.getVersionWebview();
  }
  getVersion() {
    return 0.1;
  }
  getVersionWebview() {
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Remix plugin</title>
	</head>
	<body>
		<h1>Remix Webview plugin v0.1</h1>
	</body>
	</html>`;
  }
}
