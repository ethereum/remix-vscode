import * as vscode from "vscode";
import { Uri } from "vscode";
import { PluginData } from "./pluginlist";

export class RmxPluginsProvider implements vscode.TreeDataProvider<PluginInterface> {
  private _onDidChangeTreeData: vscode.EventEmitter<PluginInterface | undefined> = new vscode.EventEmitter<
    PluginInterface | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<PluginInterface | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  refresh(data): void {
    this._onDidChangeTreeData.fire(data);
  }

  getTreeItem(element: PluginInterface): vscode.TreeItem {
    return element;
  }

  getChildren(element?: PluginInterface): Thenable<PluginInterface[]> {
    return this.getRmxPlugins().then((children) => {
      return Promise.resolve(children);
    });
  }

  private async getRmxPlugins(): Promise<PluginInterface[]> {
    const toPlugin = (pluginName: string, id: string, version: string, icon: string): PluginInterface => {
      return new PluginInterface(
        pluginName,
        id,
        version,
        vscode.TreeItemCollapsibleState.None,
        {
          command: "rmxPlugins.showPluginOptions",
          title: pluginName,
          arguments: [id],
        },
        Uri.parse(icon)
      );
    };
    try {
      const data = PluginData;
      const plugins = data
        ? data.map((plugin) => toPlugin(plugin.displayName, plugin.name, plugin.version, plugin.icon))
        : [];
      return Promise.resolve(plugins);
    } catch (error) {
      throw error;
    }
  }
}

export class PluginInterface extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly iconURI?: Uri
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
    light: this.iconURI,
    dark: this.iconURI,
  };
  contextValue = "options";
}
