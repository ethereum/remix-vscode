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
import {
  absolutePath,
  relativePath,
} from "@remixproject/engine-vscode/util/path";
import { PluginManager, Engine } from "@remixproject/engine";

import { ThemeUrls } from "@remixproject/plugin-api";
import {
  VscodeAppManager,
  WebviewPlugin,
  ThemePlugin,
  EditorPlugin,
  EditorOptions,
  transformCmd,
  ThemeOptions,
} from "@remixproject/engine-vscode";

import VscodeFileManager from "./plugins/file_manager";

import { RmxPluginsProvider } from "./rmxPlugins";
import NativeSolcPlugin from "./plugins/native_solidity_plugin";
import Terminal from "./plugins/terminal";
import DeployModule from "./plugins/udapp";
import {
  pluginActivate,
  pluginDeactivate,
  pluginDocumentation,
  pluginUninstall,
  runCommand,
} from "./optionInputs";
import { ExtAPIPlugin } from "./plugins/ext_api_plugin";
import { ToViewColumn, GetPluginData } from "./utils";
import { PluginInfo, CompilerInputOptions } from "./types";
import { Profile } from "@remixproject/plugin-utils";
import WalletConnect from "./plugins/walletProvider";
import { Web3ProviderModule } from "./plugins/web3provider";
import RemixDProvider from "./plugins/remixDProvider";
import semver from "semver";
import { FetchAndCompile, OffsetToLineColumnConverter, CompilerMetadata, CompilerArtefacts, CompilerImports } from "@remix-project/core-plugin";

import SettingsModule from "./plugins/settings";
import { NetworkModule } from "./plugins/network";


const path = require("path");

class VscodeManager extends VscodeAppManager {
  onActivation() {}
}

export async function activate(context: ExtensionContext) {
  console.log("CONTEXT 2", context)  
  let selectedVersion: string = null;
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
  const rmxControlsProvider = new RmxPluginsProvider(
    workspace.workspaceFolders[0].uri.fsPath
  );
  const editoropt: EditorOptions = { language: "solidity", transformCmd };
  const engine = new Engine();
  const manager = new VscodeManager();
  const solpl = new NativeSolcPlugin();
  const terminal = new Terminal();
  const deployModule = new DeployModule();
  const web3Povider = new Web3ProviderModule();
  const networkModule = new NetworkModule();
  const RemixD = new RemixDProvider();
  const vscodeExtAPI = new ExtAPIPlugin();
  const wallet = new WalletConnect();
  const filemanager = new VscodeFileManager();
  const editorPlugin = new EditorPlugin(editoropt);
  const settings = new SettingsModule();
  // compiler
  const importer = new CompilerImports();
  const artefacts = new CompilerArtefacts();
  const fetchAndCompile = new FetchAndCompile();
  const offsetToLineColumnConverter = new OffsetToLineColumnConverter();
  const metadata = new CompilerMetadata()

  const themeURLs: Partial<ThemeUrls> = {
    light:
      "https://remix-alpha.ethereum.org/assets/css/themes/remix-light_powaqg.css",
    dark: "https://remix.ethereum.org/assets/css/themes/remix-dark_tvx1s2.css",
  };
  const themeOpts: ThemeOptions = { urls: themeURLs };
  const theme = new ThemePlugin(themeOpts);

  filemanager.setContext(context);
  settings.setContext(context);

  engine.setPluginOption = ({ name, kind }) => {
    if (kind === "provider") return { queueTimeout: 60000 * 2 };
    if (name === "udapp") return { queueTimeout: 60000 * 2 };
    if (name === "LearnEth") return { queueTimeout: 60000 };
    return { queueTimeout: 10000 };
  };

  engine.register([
    manager,
    solpl,
    terminal,
    filemanager,
    editorPlugin,
    theme,
    web3Povider,
    deployModule,
    networkModule,
    wallet,
    vscodeExtAPI,
    RemixD,
    importer,
    artefacts,
    fetchAndCompile,
    offsetToLineColumnConverter,
    settings,
    metadata,
  ]);
  window.registerTreeDataProvider("rmxControls2", rmxControlsProvider);
  window.registerTreeDataProvider("rmxControls", rmxControlsProvider);
  window.registerTreeDataProvider("rmxPlugins", rmxPluginsProvider);

  await manager.activatePlugin(["web3Provider", "udapp", "network"]);
  await deployModule.setListeners();
  await networkModule.setListeners();
  await manager.activatePlugin([
    "walletconnect",
    "remixdprovider",
    "fileManager",
    "settings",
    "contentImport",
    "compilerArtefacts",
    "fetchAndCompile",
    "offsetToLineColumnConverter",
    'compilerMetadata',
  ]);

  // fetch default data from the plugins-directory filtered by engine
  let defaultPluginData = await manager.registeredPluginData();
  let rmxControls = [
    {
      name: "vscodeudapp",
      displayName: "Run & Deploy",
      events: [],
      methods: ["displayUri"],
      version: "0.1.0",
      url: "https://vscoderemixudapp.web.app",
      //url: "http://localhost:3000",
      documentation:
        "https://github.com/bunsenstraat/remix-vscode-walletconnect",
      description: "Connect to a network to run and deploy.",
      icon: { 
        light:Uri.file(path.join(context.extensionPath, "resources/light", "deployAndRun.webp")),
        dark:Uri.file(path.join(context.extensionPath, "resources/dark", "deployAndRun.webp"))
      },
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.9",
      },
    },
    {
      name: "remixd",
      displayName: "Start remixd client",
      events: [],
      methods: [],
      version: "0.1.0",
      url: "",
      documentation:
        "",
      description: "Start a remixd client",
      icon: Uri.file(
        path.join(context.extensionPath, "resources", "redbutton.svg")
      ),
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.9",
      },
      options: {
        Start: runCommand,
        Stop: runCommand,
      },
      optionArgs: {
        Start: "rmxPlugins.startRemixd",
        Stop: "rmxPlugins.stopRemixd",
      },
    },
    {
      name: "solidityversion",
      displayName: "Set compiler version",
      events: [],
      methods: [],
      version: "0.1.0",
      url: "",
      description: "",
      icon: { 
        light:Uri.file(path.join(context.extensionPath, "resources/light", "solidity.webp")),
        dark:Uri.file(path.join(context.extensionPath, "resources/dark", "solidity.webp"))
      },
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.9",
      },
      options: {
        Select: runCommand,
      },
      optionArgs: {
        Select: "rmxPlugins.versionSelector",
      },
    },
    {
      name: "compiler",
      displayName: "Compiler",
      events: [],
      methods: [],
      version: "0.1.0",
      url: "",
      description: "Compile contracts",
      icon: { 
        light:Uri.file(path.join(context.extensionPath, "resources/light", "solidity.webp")),
        dark:Uri.file(path.join(context.extensionPath, "resources/dark", "solidity.webp"))
      },
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.9",
      },
      options: {
        Select: runCommand,
      },
      optionArgs: {
        Select: "rmxPlugins.compileFiles",
      },
    },
    {
      name: "debugger",
      displayName: "Debugger",
      events: [],
      methods: ['debug', 'getTrace'],
      version: "0.1.0",
      url: "https://debuggervscode.web.app/",
      documentation:
        "https://remix-ide.readthedocs.io/en/latest/debugger.html",
      description: "Transaction debugger",
      icon: { 
        light:Uri.file(path.join(context.extensionPath, "resources/light", "debugger.webp")),
        dark:Uri.file(path.join(context.extensionPath, "resources/dark", "debugger.webp"))
      },
      location: "sidePanel",
      targets: ["vscode"],
      targetVersion: {
        vscode: ">=0.0.9",
      },
    },
  ];

  rmxPluginsProvider.setDefaultData(defaultPluginData);
  rmxControlsProvider.setDefaultData(rmxControls);
  // compile

  commands.registerCommand("rmxPlugins.compileFiles", async () => {
    try {
      const files = filemanager.getOpenedFiles();

      const opts: Array<QuickPickItem> = Object.values(files)
        .filter((x: any) => ( path.extname(x) === ".sol" || path.extname(x) === ".yul"))
        .map((v): QuickPickItem => {
          const vopt: QuickPickItem = {
            label: v,
            description: `Compile ${v}`,
          };
          return vopt;
        });
      window.showQuickPick(opts).then(async (selected) => {
        if (selected) {
          await manager.activatePlugin([
            "solidity",
            "fileManager",
            "editor",
            "contentImport",
            "compilerArtefacts",
          ]);
          await filemanager.switchFile(selected.label);

          solpl.compile(selectedVersion, compilerOpts, selected.label);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  commands.registerCommand("rmxPlugins.compile", async () => {
    await manager.activatePlugin([
      "solidity",
      "fileManager",
      "editor",
      "contentImport",
      "compilerArtefacts",
    ]);
    solpl.compile(selectedVersion, compilerOpts);
  });
  commands.registerCommand("rmxPlugins.compile.solidity", async () => {
    await manager.activatePlugin([
      "solidity",
      "terminal",
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
      [...rmxPluginsProvider.getData(), ...rmxControlsProvider.getData()]
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

  commands.registerCommand("rmxPlugins.testaction", async () => {
    //sharedFolderClient.call("fileManager",'getCurrentFile')
    //RemixD.connect(undefined)
    //let file = await filemanager.call('fileManager', 'getOpenedFiles')
    console.log("test");
    try {
      //await filemanager.call('fileManager', 'writeFile', 'deps/test/something/burp','burp')
      // filemanager.exists('deps/test/something/burp').then((x)=>{
      //   console.log(x)
      // })
      //importer.resolveAndSave('https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol','')
      //console.log(await filemanager.call('contentImport', 'resolveAndSave', '@openzeppelin/contracts/token/ERC1155/ERC1155.sol', ''))
      //console.log(await filemanager.call('solidity-logic', 'compile', 's.sol'))
      //importer.resolveAndSave('@openzeppelin/contracts/token/ERC1155/ERC1155.sol','')
      await manager.activatePlugin(["solidity"]);
      console.log(await solpl._setCompilerVersionFromPragma("s.sol"));
    } catch (e) {
      console.log(e);
    }
    return;
    console.log("test");
    for (let d of workspace.textDocuments) {
      console.log(relativePath(d.fileName));
    }
    //console.log(file)
  });

  RemixD.on("remixdprovider" as any, "statusChanged", (x: any) => {
    //console.log("STATUS CHANGE", x);
    const icons = {
      waiting: "yellowbutton.svg",
      connected: "greenbutton.svg",
      disconnected: "redbutton.svg",
    };
    rmxControlsProvider.setDataForPlugin("remixd", {
      icon: Uri.file(path.join(context.extensionPath, "resources", icons[x])),
      description: x,
    });
  });

  commands.registerCommand("rmxPlugins.startRemixd", async () => {
    RemixD.connect(undefined);
  });

  commands.registerCommand("rmxPlugins.stopRemixd", async () => {
    RemixD.disconnect();
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
      url: "http://localhost:3000",
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
    const pluginData = GetPluginData(id, [...rmxPluginsProvider.getData(), ...rmxControlsProvider.getData()]);
    const options: {
      [key: string]: (context: ExtensionContext, id: string) => Promise<void>;
    } = pluginData.options || {
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
    if (Object.keys(options).length == 1) { 
      const args =
      (pluginData.optionArgs &&
        pluginData.optionArgs[Object.keys(options)[0]]) ||
      id;
      options[Object.keys(options)[0]](context, args)
    } else {
      const quickPick = window.createQuickPick();
      quickPick.items = Object.keys(options).map((label) => ({ label }));
      quickPick.onDidChangeSelection((selection) => {
        const args =
          (pluginData.optionArgs &&
            pluginData.optionArgs[selection[0].label]) ||
          id;
        if (selection[0]) {
          options[selection[0].label](context, args).catch(console.error);
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }
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
      
      const versions = {...{'latest':'latest'},...solpl.getSolidityVersions()};

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
          solpl.setVersion(selectedVersion)
          rmxControlsProvider.setDataForPlugin("solidityversion",{
            description: selectedVersion
          })
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
