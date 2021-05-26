"use strict";
import {
  window,
  commands,
  workspace,
  InputBoxOptions,
  ExtensionContext,
  QuickPickItem,
  env,
  Uri,
  extensions,
} from "vscode";
import { PluginManager, Engine } from "@remixproject/engine";
import { ThemeUrls } from "@remixproject/plugin-api";
import {
  VscodeAppManager,
  WebviewPlugin,
  ThemePlugin,
  FileManagerPlugin,
  EditorPlugin,
  EditorOptions,
  transformCmd,
  ThemeOptions,
  ContentImportPlugin,
} from "@remixproject/engine-vscode";

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import DeployModule from "./plugins/udapp";
import {
  pluginActivate,
  pluginDeactivate,
  pluginDocumentation,
  pluginUninstall,
} from "./optionInputs";
import { ExtAPIPlugin } from "./plugins/ext_api_plugin";
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo, CompilerInputOptions } from "./types";
import { Profile } from "@remixproject/plugin-utils";
import WalletConnect from "./plugins/wallet";
import { Web3ProviderModule } from "./plugins/web3provider";
import semver from "semver";
const queryString = require("query-string");

class VscodeManager extends VscodeAppManager {
  onActivation() {
  }
}

export async function activate(context: ExtensionContext) {
  let selectedVersion: string = "latest";
  let compilerOpts: CompilerInputOptions = {
    language: "Solidity",
    optimize: false,
    runs: 200,
  };
  if (!workspace.workspaceFolders || !workspace.workspaceFolders[0]) {
    window.showErrorMessage(
      "Please open a workspace or folder before using this extension."
    );
    return false;
  }
  const rmxPluginsProvider = new RmxPluginsProvider(
    workspace.workspaceFolders[0].uri.fsPath
  );
  const editoropt: EditorOptions = { language: "solidity", transformCmd };
  const engine = new Engine();
  const manager = new VscodeManager();
  const solpl = new NativeSolcPlugin();
  const deployModule = new DeployModule();
  const web3Povider = new Web3ProviderModule();
  const vscodeExtAPI = new ExtAPIPlugin();
  const wallet = new WalletConnect();
  const filemanager = new FileManagerPlugin();
  const editorPlugin = new EditorPlugin(editoropt);
  const importer = new ContentImportPlugin();
  const themeURLs: Partial<ThemeUrls> = {
    light:
      "https://remix-alpha.ethereum.org/assets/css/themes/remix-light_powaqg.css",
    dark: "https://remix-alpha.ethereum.org/assets/css/themes/remix-dark_tvx1s2.css",
  };
  const themeOpts: ThemeOptions = { urls: themeURLs };
  const theme = new ThemePlugin(themeOpts);

  engine.setPluginOption = ({ name, kind }) => {
    if (kind === "provider") return { queueTimeout: 60000 * 2 };
    if (name === "udapp") return { queueTimeout: 60000 * 2 };
    if (name === "LearnEth") return { queueTimeout: 60000 };
    return { queueTimeout: 10000 };
  };

  engine.register([
    manager,
    solpl,
    filemanager,
    editorPlugin,
    theme,
    importer,
    web3Povider,
    deployModule,
    wallet,
    vscodeExtAPI,
  ]);
  window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);

  await manager.activatePlugin([
    "web3Provider",
    "udapp",
  ]);
  await deployModule.setListeners();
  await manager.activatePlugin(["walletconnect"]);

  // fetch default data from the plugins-directory filtered by engine
  const defaultPluginData = await manager.registeredPluginData();
  /* const defaultPluginData = [
    {
      name: "vscodeudapp",
      displayName: "Deploy & Run",
      events: [],
      methods: ["displayUri"],
      version: "0.1.0",
      url: "http://localhost:3000",
      documentation:
        "https://github.com/bunsenstraat/remix-vscode-walletconnect",
      description: "Connect to a network to run and deploy.",
      icon: "https://remix.ethereum.org/assets/img/deployAndRun.webp",
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.8",
      },
    },
  ];  */
  rmxPluginsProvider.setDefaultData(defaultPluginData);
  // compile
  commands.registerCommand("rmxPlugins.compile", async () => {
    await manager.activatePlugin([
      "solidity",
      "fileManager",
      "editor",
      "contentImport",
    ]);
    solpl.compile(selectedVersion, compilerOpts);
  });
  commands.registerCommand("rmxPlugins.compile.solidity", async () => {
    await manager.activatePlugin([
      "solidity",
      "fileManager",
      "editor",
      "contentImport",
    ]);
    try {
      let solextension = extensions.getExtension("juanblanco.solidity");
      if (solextension.isActive) {
        solpl.compileWithSolidityExtension();
      } else {
        window.showErrorMessage("The Solidity extension is not enabled.");
      }
    } catch (e) {
      window.showErrorMessage("The Solidity extension is not installed.");
    }
  });

  const checkSemver = async (pluginData: PluginInfo) => {
    if (!(pluginData.targetVersion && pluginData.targetVersion.vscode))
      return true;
    return semver.satisfies(
      context.extension.packageJSON.version,
      pluginData.targetVersion.vscode
    );
  };

  const activatePlugin = async (pluginId: string) => {
    // Get plugininfo from plugin array
    const pluginData: PluginInfo = GetPluginData(
      pluginId,
      rmxPluginsProvider.getData()
    );
    const versionCheck = await checkSemver(pluginData);
    if (!versionCheck) {
      window.showErrorMessage(
        `This plugin requires an update of the extension. Please update now.`
      );
      return false;
    }
    // choose window column for display
    const cl = ToViewColumn(pluginData);
    const plugin = new WebviewPlugin(pluginData, { context, column: cl });
    if (!engine.isRegistered(pluginId)) {
      // @ts-ignore
      engine.register(plugin);
    }

    manager.activatePlugin([
      pluginId,
      "solidity",
      "fileManager",
      "editor",
      "vscodeExtAPI",
    ]);
    const profile: Profile = await manager.getProfile(pluginId);
    window.showInformationMessage(
      `${profile.displayName} v${profile.version} activated.`
    );
  };

  commands.registerCommand("rmxPlugins.walletConnect", async () => {
    //await manager.activatePlugin(['walletconnect']);
    //await activatePlugin('qr')
    await wallet.connect();
    //await web3Module.deploy()
  });

  commands.registerCommand("rmxPlugins.walletDisconnect", async () => {
    //await manager.activatePlugin(['walletconnect']);
    await wallet.disconnect();
    //await web3Module.deploy()
  });

  commands.registerCommand("rmxPlugins.deploy", async () => {
    // await wallet.connect();
    const contracts = Object.keys(deployModule.compiledContracts);
    const opts: Array<QuickPickItem> = contracts.map((v): QuickPickItem => {
      const vopt: QuickPickItem = {
        label: v,
        description: `Deploy contract: ${v}`,
      };
      return vopt;
    });
    window.showQuickPick(opts).then(async (selected) => {
      if (selected) {
        await deployModule.deploy(selected.label, []);
      }
    });
  });

  // activate plugin
  commands.registerCommand(
    "extension.activateRmxPlugin",
    async (pluginId: string) => {
      await activatePlugin(pluginId);
    }
  );
  commands.registerCommand("rmxPlugins.refreshEntry", () => {
    rmxPluginsProvider.refresh();
  });
  commands.registerCommand("rmxPlugins.addEntry", () => {
    const pluginjson: PluginInfo = {
      name: "remix-plugin-example",
      displayName: "Remix plugin example",
      methods: [],
      version: "0.0.1-dev",
      url: "",
      description: "Run remix plugin in your Remix project",
      icon: "",
      location: "sidePanel",
    };
    const opts: InputBoxOptions = {
      value: JSON.stringify(pluginjson),
      placeHolder: "Add your plugin JSON",
    };
    window.showInputBox(opts).then((input: string) => {
      if (input && input.length > 0) {
        const devPlugin: PluginInfo = JSON.parse(input);
        rmxPluginsProvider.add(devPlugin);
      }
    });
  });
  commands.registerCommand(
    "rmxPlugins.uninstallRmxPlugin",
    async (pluginId: string) => {
      commands.executeCommand("extension.deActivateRmxPlugin", pluginId);
      rmxPluginsProvider.remove(pluginId);
    }
  );
  commands.registerCommand("rmxPlugins.showPluginOptions", async (plugin) => {
    let id = "";
    if (plugin instanceof Object) id = plugin.id;
    else id = plugin;
    const pluginData = GetPluginData(id, rmxPluginsProvider.getData());
    const options: {
      [key: string]: (context: ExtensionContext, id: string) => Promise<void>;
    } = {
      Activate: pluginActivate,
      Deactivate: pluginDeactivate,
    };
    if (pluginData.documentation)
      options["Documentation"] = pluginDocumentation;
    if (
      (pluginData.targets && !pluginData.targets.includes("vscode")) ||
      !pluginData.targets
    )
      options["Uninstall"] = pluginUninstall;
    const quickPick = window.createQuickPick();
    quickPick.items = Object.keys(options).map((label) => ({ label }));
    quickPick.onDidChangeSelection((selection) => {
      if (selection[0]) {
        options[selection[0].label](context, id).catch(console.error);
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });
  commands.registerCommand(
    "extension.deActivateRmxPlugin",
    async (pluginId: string) => {
      manager.deactivatePlugin([pluginId]);
      editorPlugin.discardDecorations();
    }
  );
  // Version selector
  commands.registerCommand("rmxPlugins.versionSelector", async () => {
    try {
      await manager.activatePlugin(["solidity"]);
      const versions = solpl.getSolidityVersions();
      const opts: Array<QuickPickItem> = Object.keys(versions).map(
        (v): QuickPickItem => {
          const vopt: QuickPickItem = {
            label: v,
            description: `Solidity ${v}`,
          };
          return vopt;
        }
      );
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          selectedVersion = selected.label;
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  // Optimizer selector
  commands.registerCommand("rmxPlugins.optimizerSelector", async () => {
    try {
      const opts: Array<QuickPickItem> = [
        {
          label: "Enable",
          description: "Enable optimizer",
        },
        {
          label: "Disable",
          description: "Disable optimizer",
        },
      ];
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          compilerOpts.optimize = Boolean(selected.label === "Enable");
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
  // Language selector
  commands.registerCommand("rmxPlugins.languageSelector", async () => {
    try {
      const opts: Array<QuickPickItem> = [
        {
          label: "Solidity",
          description: "Enable Solidity language",
        },
        {
          label: "Yul",
          description: "Enable Yul language",
        },
      ];
      window.showQuickPick(opts).then((selected) => {
        if (selected) {
          switch (selected.label) {
            case "Solidity":
              compilerOpts.language = "Solidity";
              compilerOpts.optimize = false;
              break;
            case "Yul":
              compilerOpts.language = "Yul";
              compilerOpts.optimize = false;
              break;
            default:
              compilerOpts.language = "Solidity";
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  commands.registerCommand(
    "rmxPlugins.openDocumentation",
    async (pluginId: string) => {
      const pluginData: PluginInfo = GetPluginData(
        pluginId,
        rmxPluginsProvider.getData()
      );
      if (pluginData.documentation)
        env.openExternal(Uri.parse(pluginData.documentation));
      else
        window.showWarningMessage(
          `Documentation not provided for ${pluginData.displayName}.`
        );
    }
  );
}
