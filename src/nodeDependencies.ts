import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No dependency in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			return Promise.resolve(this.getDepsInPackageJson(path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')));
		} else {
			const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
			if (this.pathExists(packageJsonPath)) {
				return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
			} else {
				vscode.window.showInformationMessage('Workspace has no package.json');
				return Promise.resolve([]);
			}
		}

	}

	/**
	 * Given the path to package.json, read all its dependencies and devDependencies.
	 */
	private getDepsInPackageJson(packageJsonPath: string): PluginInterface[] {
		if (this.pathExists(packageJsonPath)) {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			const toDep = (moduleName: string, version: string): PluginInterface => {
				if (this.pathExists(path.join(this.workspaceRoot, 'node_modules', moduleName))) {
					return new PluginInterface(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed);
				} else {
					return new PluginInterface(moduleName, version, vscode.TreeItemCollapsibleState.None, {
						command: 'extension.openPackageOnNpm',
						title: '',
						arguments: [moduleName]
					});
				}
			};
			
			const deps = packageJson.remixPlugins
				? Object.keys(packageJson.remixPlugins).map(dep => toDep(dep, packageJson.dependencies[dep]))
				: [];
			// TODO: may be we could also have dev plugins for plugin developers
			// const devDeps = packageJson.devDependencies
			// 	? Object.keys(packageJson.devDependencies).map(dep => toDep(dep, packageJson.devDependencies[dep]))
			// 	: [];
			// return deps.concat(devDeps);
			return deps
		} else {
			return [];
		}
	}

	private pathExists(p: string): boolean {
		try {
			fs.accessSync(p);
		} catch (err) {
			return false;
		}
		return true;
	}
}

export class PluginInterface extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private version: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
	}
	get tooltip(): string {
		return `${this.label}-${this.version}`;
	}
	get description(): string {
		return this.version;
	}
	iconPath = {
		light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
		dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
	};
	contextValue = 'plugin';
}
