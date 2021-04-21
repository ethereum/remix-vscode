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
  QuickPickItem,
} from "vscode";
import Web3 from "web3";

const profile = {
  name: "deploy",
  displayName: "deploy",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["deploy"],
  kind: "file-system",
};
export default class DeployModule extends Plugin {
  private outputChannel: OutputChannel;
  private web3Provider;
  public compiledContracts;
  private accounts: string[] = [];
  private web3: Web3;
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
    console.log(profile);
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
        this.web3 = new Web3(this.web3Provider);
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

  async showContractPicker() {
    const keys = Object.keys(this.compiledContracts);
    console.log(keys);
  }

  async detectNetwork() {
    this.web3.eth.net.getId((err, id) => {
      let networkName: string = null;
      if (err) {
        this.print(`Could not detect network! Please connnect to your wallet.`);
        return
      }
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
      else if (id === 1) networkName = "Main";
      else if (id === 2) networkName = "Morden (deprecated)";
      else if (id === 3) networkName = "Ropsten";
      else if (id === 4) networkName = "Rinkeby";
      else if (id === 5) networkName = "Goerli";
      else if (id === 42) networkName = "Kovan";
      else networkName = "Custom";
      this.print(`Network is ${networkName}!`);
    });
  }

  async deploy(contractName: string) {
    const selectedContractKey = Object.keys(this.compiledContracts).find(
      (name) => name == contractName
    );
    console.log(selectedContractKey);
    const c = this.compiledContracts[selectedContractKey];
    console.log(c);
    this.print(`Deploying contract ${contractName} started!`);
    //this.print(`Deploying  ${Object.keys(c)} ...`);
    try {
      if (!this.web3Provider) {
        this.print(
          "No Web3 provider activated! Please activate a wallet or web3 provider plugin."
        );
        return;
      }
      await this.detectNetwork()
      console.log("content abi", c.abi);
      let contract = new this.web3.eth.Contract(c.abi);
      console.log("content bytecode", c.evm.bytecode.object);
      let deployObject = contract.deploy({
        data: c.evm.bytecode.object,
      });
      console.log("deploy object ", deployObject);
      let gasValue = await deployObject.estimateGas();
      const gasBase = Math.ceil(gasValue * 1.2);
      const gas = gasBase;
      this.print(`Gas estimate ${gas}`);
      let accounts = await this.web3.eth.getAccounts();
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
      this.print(`There are errors deploying.`)
    }
  }
}
