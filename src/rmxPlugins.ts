import * as vscode from "vscode";
import { Uri } from "vscode";
import axios from "axios";

export class RmxPluginsProvider
  implements vscode.TreeDataProvider<PluginInterface> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    PluginInterface | undefined
  > = new vscode.EventEmitter<PluginInterface | undefined>();
  readonly onDidChangeTreeData: vscode.Event<PluginInterface | undefined> = this
    ._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
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
    const toPlugin = (
	  pluginName: string,
	  id: string,
      version: string,
      icon: string
    ): PluginInterface => {
      return new PluginInterface(
		pluginName,
		id,
        version,
        vscode.TreeItemCollapsibleState.None,
        {
          command: "extension.activateRmxPlugin",
          title: pluginName,
          arguments: [id],
        },
        Uri.parse(icon)
      );
    };
    try {
      // fetch plugins from https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json
      //   const resp = await axios.get(
      //     "https://raw.githubusercontent.com/ethereum/remix-plugins-directory/master/build/metadata.json"
      //   );
      //   const { data } = resp;
      const data = [
        {
          name: "native-plugin",
          displayName: "Remix Native Plugin Example",
          description: "An example of a plugin that works by message passing.",
          version: "0.0.1",
          events: [],
          methods: [],
          kind: "none",
          icon: "https://image.flaticon.com/icons/svg/1570/1570493.svg",
          location: "sidePanel",
          url: "ipfs://Qmbvpaz1FUgfVNG4V9RP2iLrg6pufradBYgcL6FSBqXveP",
        },
        {
          name: "iframe-plugin",
          displayName: "Remix iframe Plugin Example",
          description: "An example of a plugin that runs in an iframe.",
          version: "0.0.1",
          methods: [],
          kind: "none",
          icon:
            "data:image/png;base64,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",
          location: "sidePanel",
          url: "https://remix.fuel.sh",
        },
      ];
      console.log(data);
      const plugins = data
        ? data.map((plugin) =>
            toPlugin(plugin.displayName, plugin.name, plugin.version, plugin.icon)
          )
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
}
