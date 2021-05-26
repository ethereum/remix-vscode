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
import { AbiInput, AbiItem } from "web3-utils";

const profile = {
  name: "udapp",
  displayName: "udapp",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["deploy", "send", "addNetwork", "getAccounts", "setAccount", "disconnect"],
  events: ["receipt", "deploy"],
  kind: "file-system",
};
export default class DeployModule extends Plugin {
  private outputChannel: OutputChannel;
  private web3Provider;
  public compiledContracts;
  private accounts: string[] = [];
  private web3: Web3;
  private networkName: string;
  constructor() {
    super(profile);
    this.outputChannel = window.createOutputChannel("Remix IDE");
    this.compiledContracts = {};
  }

  async setListeners() {
    // listen for plugins
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
        this.compiledContracts = data.contracts[file];
      }
    );
  }

  async addNetwork(network: string) {
    let networkprovider = new Web3.providers.HttpProvider(network);
    this.call("web3Provider", "setProvider", networkprovider);
  }

  async setAccount(account: string) {
    this.web3.eth.defaultAccount = account;
    this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
  }

  async getAccounts(setAccount: boolean = true) {
    try {
      if (await this.web3.eth.net.isListening()) {
        let accounts = await this.web3.eth.getAccounts();
        if (setAccount){
          if (accounts.length > 0) this.web3.eth.defaultAccount = accounts[0];
          this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
        }
        return accounts;
      }
    } catch (e) {
      console.log(e);
    }
    return [];
  }

  // web3
  async addPluginProvider(profile) {
    if (profile.kind === "provider") {
      ((profile, app) => {
        let web3Provider = {
          async sendAsync(payload, callback) {
            try {
              const result = await app.call(profile.name, "sendAsync", payload);
              callback(null, result);
            } catch (e) {
              callback(e);
            }
          },
        };
        this.call("web3Provider", "setProvider", web3Provider);
        this.web3Provider = {
          async sendAsync(payload, callback) {
            try {
              const result = await app.call(
                "web3Provider",
                "sendAsync",
                payload
              );
              callback(null, result);
            } catch (e) {
              callback(e);
            }
          },
        };
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
  }

  async detectNetwork() {
    await this.web3.eth.net.getId((err, id) => {
      this.networkName = null;
      if (err) {
        this.print(`Could not detect network! Please connnect to your wallet.`);
        return;
      }
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
      else if (id === 1) this.networkName = "Main";
      else if (id === 2) this.networkName = "Morden (deprecated)";
      else if (id === 3) this.networkName = "Ropsten";
      else if (id === 4) this.networkName = "Rinkeby";
      else if (id === 5) this.networkName = "Goerli";
      else if (id === 42) this.networkName = "Kovan";
      else this.networkName = "Custom";
      this.print(`Network is ${this.networkName}!`);
    });
  }

  async txDetailsLink(hash: string) {
    await this.detectNetwork();
    const transactionDetailsLinks = {
      Main: "https://www.etherscan.io/address/",
      Rinkeby: "https://rinkeby.etherscan.io/address/",
      Ropsten: "https://ropsten.etherscan.io/address/",
      Kovan: "https://kovan.etherscan.io/address/",
      Goerli: "https://goerli.etherscan.io/address/",
    };

    if (transactionDetailsLinks[this.networkName]) {
      return transactionDetailsLinks[this.networkName] + hash;
    }
  }

  async getContract(contractName: string) {
    const selectedContractKey = Object.keys(this.compiledContracts).find(
      (name) => name == contractName
    );
    const c = this.compiledContracts[selectedContractKey];
    console.log(c);
    return c;
  }

  async deploy(contractName: string, payload: any[]) {
    const c = await this.getContract(contractName);
    if (!c) {
      this.print("No contract specified.");
      return;
    }
    this.print(`Deploying contract ${contractName} started!`);
    //this.print(`Deploying  ${Object.keys(c)} ...`);
    try {
      if (!this.web3Provider) {
        this.print(
          "No Web3 provider activated! Please activate a wallet or web3 provider plugin."
        );
        return;
      }
      let accounts = await this.web3.eth.getAccounts();
      await this.detectNetwork();
      let contract = new this.web3.eth.Contract(c.abi);
      let deployObject = contract.deploy({
        data: c.evm.bytecode.object,
        arguments: payload,
      });
      let gasValue = await deployObject.estimateGas();
      const gasBase = Math.ceil(gasValue * 1.2);
      const gas = gasBase;
      this.print(`Gas estimate ${gas}`);

      let me = this;
      await deployObject
        .send({
          from: this.web3.eth.defaultAccount,
          gas: gas,
        })
        .on("receipt", async function (receipt) {
          me.emit("deploy", { receipt: receipt, abi:c.abi, contractName: contractName })
          me.print(`Contract deployed at ${receipt.contractAddress}`);
          const link: string = await me.txDetailsLink(receipt.contractAddress);
          me.print(link);
        });
      this.print("Deploying ...");
    } catch (e) {
      console.log("ERROR ", e);
      this.print(`There are errors deploying: ${e}`);
      throw new Error(`There are errors deploying: ${e}`);
    }
  }

  async send(abi: AbiItem, payload: any[], address: string) {
    try {
      if (!this.web3Provider) {
        this.print(
          "No Web3 provider activated! Please activate a wallet or web3 provider plugin."
        );
        return;
      }
      await this.detectNetwork();

      let contract = new this.web3.eth.Contract(
        JSON.parse(JSON.stringify([abi])),
        address
      );
      let accounts = await this.web3.eth.getAccounts();
      if (abi.stateMutability === "view" || abi.stateMutability === "pure") {
        try {
          this.print(
            `Calling method '${abi.name}' with ${JSON.stringify(
              payload
            )} from ${
              this.web3.eth.defaultAccount
            } at contract address ${address}`
          );
          const txReceipt = abi.name
            ? await contract.methods[abi.name](...payload).call({
                from: this.web3.eth.defaultAccount,
              })
            : null;
          this.print(JSON.stringify(txReceipt));
          return txReceipt;
          // TODO: LOG
        } catch (e) {
          console.error(e);
          throw new Error(`There are errors calling: ${e}`);
        }
      } else {
        try {
          this.print(
            `Send data to method '${abi.name}' with ${JSON.stringify(
              payload
            )} from ${
              this.web3.eth.defaultAccount
            } at contract address ${address}`
          );
          const txReceipt = abi.name
            ? await contract.methods[abi.name](...payload).send({
                from: this.web3.eth.defaultAccount,
              })
            : null;
          this.print(JSON.stringify(txReceipt));
          return txReceipt;
          // TODO: LOG
        } catch (e) {
          console.error(e);
          throw new Error(`There are errors sending data: ${e}`);
        }
      }
    } catch (e) {
      console.log("ERROR ", e);
      this.print(`There are errors sending data.`);
      throw new Error(`There are errors sending data: ${e}`);
    }
  }
}
