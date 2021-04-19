import { Plugin } from "@remixproject/engine";
import {
  absolutePath,
  relativePath,
} from "@remixproject/engine-vscode/util/path";
import {
  window,
  workspace,
  Uri,
  commands,
  ViewColumn,
  InputBoxOptions,
  OutputChannel,
} from "vscode";
import Web3 from "web3";


const profile = {
  name: "web3",
  displayName: "web3",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["deploy"],
  kind: "file-system",
};
export default class Web3Module extends Plugin {
  private outputChannel: OutputChannel;
  private web3Provider;
  private compiledContracts;
  private accounts: string[] = [];
  constructor() {
    super(profile);
    this.outputChannel = window.createOutputChannel("Remix IDE");
    this.compiledContracts = {};
  }

  async setListeners() {
    // listen for plugins
    console.log("set listeners");
    this.on(
      "manager",
      "pluginActivated",
      await this.addPluginProvider.bind(this)
    );
    this.on(
      "manager",
      "pluginDeactivated",
      await this.removePluginProvider.bind(this)
    );
    this.on(
      "solidity",
      "compilationFinished",
      (file, source, languageVersion, data) => {
        console.log("compile finished", file, source, data);
        this.compiledContracts = data.contracts[file];
        console.log(this.compiledContracts);
      }
    );
  }

  // web3
  async addPluginProvider(profile) {
    //console.log(profile)
    if (profile.kind === "provider") {
      ((profile, app) => {
        this.web3Provider = {
          async sendAsync(payload, callback) {
            try {
              const result = await app.call(profile.name, "sendAsync", payload);
              callback(null, result);
            } catch (e) {
              callback(e);
            }
          },
        };
        console.log("ADD PROVIDER ", this.web3Provider);
        //app.blockchain.addProvider({ name: profile.displayName, provider: web3Provider })
      })(profile, this);
    }
  }
  async removePluginProvider(profile) {
    if (profile.kind === "provider") this.web3Provider = null;
  }

  private getNow(): string {
    const date = new Date(Date.now());
    return date.toLocaleTimeString();
  }

  private print(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }

  async deploy() {
    this.print("Deploy started!");

    const c = this.compiledContracts[Object.keys(this.compiledContracts)[0]];
    const fileName = await this.call("fileManager", "getCurrentFile");
    console.log(c);
    //this.print(`Deploying  ${Object.keys(c)} ...`);
    try {
      if (!this.web3Provider) {
        this.print(
          "No Web3 provider activated! Please activate a wallet or web3 provider plugin."
        );
        return;
      }
      const web3 = new Web3(this.web3Provider);
      console.log("content abi", c.abi);
      let contract = new web3.eth.Contract(c.abi);
      console.log("content bytecode", c.evm.bytecode.object);
      let deployObject = contract.deploy({
        data: c.evm.bytecode.object,
      });
      console.log("deploy object ", deployObject);
      let gasValue = await deployObject.estimateGas();
      const gasBase = Math.ceil(gasValue * 1.2);
      const gas = false ? gasBase * 2 : gasBase;
      this.print(`Gas estimate ${gas}`);
      let accounts = await web3.eth.getAccounts();
      console.log(accounts);
      let me = this;
      deployObject
        .send({
          from: accounts[0],
          gas: gas,
        })
        .on("receipt", function (receipt) {
          console.log(receipt);
          me.print(`Contract deployed at ${receipt.contractAddress}`);
        });
    } catch (e) {
      console.log("ERROR ", e);
    }
  }
}
