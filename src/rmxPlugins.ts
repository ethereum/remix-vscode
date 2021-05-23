import {TreeItem, TreeDataProvider, EventEmitter, Event, TreeItemCollapsibleState, Command} from "vscode";
import { Uri } from "vscode";
import { PluginInfo } from "./types";

export class RmxPluginsProvider implements TreeDataProvider<PluginInterface> {
  private _onDidChangeTreeData: EventEmitter<PluginInterface | undefined> = new EventEmitter<PluginInterface | undefined>();
  readonly onDidChangeTreeData: Event<PluginInterface | undefined> = this._onDidChangeTreeData.event;
  private data: PluginInfo[];
  private defaultData: PluginInfo[];
  constructor(private workspaceRoot: string) {
    this.data = [];
  }

  setDefaultData(data:any[]){
    this.defaultData = data
    this.refresh()
  }

  getData(){
    return this.data
  }

  add(data: PluginInfo): void {
    this.data.push(data);
    this._onDidChangeTreeData.fire(null);
  }

  remove(id: string):void {
    this.data = this.data.filter((plugin: PluginInfo)=>{
      return plugin.name != id
    })
    this._onDidChangeTreeData.fire(null);
  }

  refresh():void {
    this.data = [... this.defaultData.sort((a,b) => (a.displayName < b.displayName)?-1:1)]
    this._onDidChangeTreeData.fire(null);
  }

  getTreeItem(element: PluginInterface): TreeItem {
    return element;
  }

  getChildren(element?: PluginInterface): Thenable<PluginInterface[]> {
    return this.getRmxPlugins().then((children) => {
      return Promise.resolve(children);
    });
  }
  private toPlugin = (pluginName: string, id: string, text: string, icon: string): PluginInterface => {
    return new PluginInterface(
      pluginName,
      id,
      text,
      TreeItemCollapsibleState.None,
      {
        command: "rmxPlugins.showPluginOptions",
        title: pluginName,
        arguments: [id],
      },
      Uri.parse(icon)
    );
  };

  private async getRmxPlugins(): Promise<PluginInterface[]> {
    try {
      const plugins = this.data
        ? this.data.map((plugin) => this.toPlugin(plugin.displayName, plugin.name, plugin.description, plugin.icon))
        : [];
      return Promise.resolve(plugins);
    } catch (error) {
      throw error;
    }
  }
}

export class PluginInterface extends TreeItem {
  constructor(
    public readonly label: string,
    public readonly id: string,
    private text: string,
    public readonly collapsibleState: TreeItemCollapsibleState,
    public readonly command?: Command,
    public readonly iconURI?: Uri
  ) {
    super(label, collapsibleState);
  }
  tooltip = `${this.label}-${this.text}`;
  description = this.text;
  iconPath = {
    light: this.iconURI,
    dark: this.iconURI,
  };
  contextValue = "options";
}
