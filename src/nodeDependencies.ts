import * as vscode from 'vscode';
import { Uri} from 'vscode';
import axios from 'axios';

export class DepNodeProvider implements vscode.TreeDataProvider<PluginInterface> {

	private _onDidChangeTreeData: vscode.EventEmitter<PluginInterface | undefined> = new vscode.EventEmitter<PluginInterface | undefined>();
	readonly onDidChangeTreeData: vscode.Event<PluginInterface | undefined> = this._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: PluginInterface): vscode.TreeItem {
		return element;
	}

	getChildren(element?: PluginInterface): Thenable<PluginInterface[]> {
		return this.getRmxPlugins()
			.then(children => {
				return Promise.resolve(children);
			})
	}

	private async getRmxPlugins(): Promise<PluginInterface[]> {
		const toPlugin = (pluginName: string, version: string, icon: string): PluginInterface => {
			return new PluginInterface(pluginName, version, vscode.TreeItemCollapsibleState.None, {
				command: '',
				title: pluginName,
				arguments: [pluginName]
			}, Uri.parse(icon));
		};
		try {
			// fetch plugins from https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json
			const resp = await axios.get('https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json');
			const { data } = resp;
			console.log(data);
			const plugins = data ? data.map(plugin => toPlugin(plugin.displayName, plugin.version, plugin.icon)) : [];
			return Promise.resolve(plugins);
		} catch(error) {
			throw error;
		}
	}
}

export class PluginInterface extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command,
		public readonly iconURI?: Uri) {
			super(label, collapsibleState);
		}
	get tooltip(): string {
		return `${this.label}-${this.version}`;
	}
	get description(): string {
		return this.version;
	}
	iconPath = {
		light: this.iconURI,
		dark: this.iconURI
	};
	contextValue = 'plugin';
}