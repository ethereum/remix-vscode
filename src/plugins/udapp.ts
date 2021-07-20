import { Plugin } from "@remixproject/engine";
import Web3 from "web3";
import { AbiItem, Unit } from "web3-utils";

const profile = {
  name: "udapp",
  displayName: "udapp",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: [
    "deploy",
    "send",
    "getAccounts",
    "setAccount",
    "disconnect",
  ],
  events: ["receipt", "deploy"],
  kind: "file-system",
};
export default class DeployModule extends Plugin {
  private web3Provider;
  public compiledContracts;
  private accounts: string[] = [];
  private web3: Web3;
  private networkName: string;
  constructor() {
    super(profile);
    this.compiledContracts = {};
  }

  async setListeners() {
    this.on(
      "solidity",
      "compilationFinished",
      (file, source, languageVersion, data) => {
        this.compiledContracts = data.contracts[file];
      }
    );
    const me = this;
    this.web3Provider = {
      async sendAsync(payload, callback) {
        try {
          const result = await me.call(
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
  }

  async setAccount(account: string) {
    this.web3.eth.defaultAccount = account;
    this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
  }

  async getAccounts(setAccount: boolean = true) {
    let provider = await this.call("web3Provider", "getProvider");
    this.print("Get accounts...");
    console.log("GET ACCOUNTS UDAPP", provider);
    if (!provider) return [];
    try {
      if (await this.web3.eth.net.isListening()) {
        let accounts = await this.web3.eth.getAccounts();
        if (setAccount) {
          if (accounts.length > 0) this.web3.eth.defaultAccount = accounts[0];
          this.print(`Account changed to ${this.web3.eth.defaultAccount}`);
        }
        return accounts;
      }
    } catch (e) {
      this.print(`Can't get accounts...`);
      console.log(e);
    }
    return [];
  }



  private print(m: string) {
    this.call("terminal", "log", m);
  }

  async showContractPicker() {
    const keys = Object.keys(this.compiledContracts);
  }

  async txDetailsLink(hash: string) {
    await this.call("network", "detectNetwork");
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

  async printReceipt(receipt: any) {
    let allowedKeys = ['hash','gas','from','to']
    let keys = Object.keys(receipt).filter((k)=> allowedKeys.findIndex((v)=> k.toLowerCase().indexOf(v)> -1) > -1)
    for (let key of keys) {
      if (receipt[key] && typeof receipt[key]!=undefined) {
        this.print(`${key.toUpperCase()} :`)
        this.print(JSON.stringify(receipt[key]))
      }
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

      await this.call("network", "detectNetwork")
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
          me.emit("deploy", {
            receipt: receipt,
            abi: c.abi,
            contractName: contractName,
          });
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

  async send(
    abi: AbiItem,
    payload: any[],
    address: string,
    value: string,
    unit: Unit,
    gaslimit: number
  ) {
    try {
      if (!this.web3Provider) {
        this.print(
          "No Web3 provider activated! Please activate a wallet or web3 provider plugin."
        );
        return;
      }
      await this.call("network", "detectNetwork")

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
            )} from ${this.web3.eth.defaultAccount
            } at contract address ${address}`
          );
          const txReceipt = abi.name
            ? await contract.methods[abi.name](...payload).call({
              from: this.web3.eth.defaultAccount,
              gas: gaslimit,
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
            )} from ${this.web3.eth.defaultAccount
            } at contract address ${address}`
          );
          console.log({
            from: this.web3.eth.defaultAccount,
            gas: gaslimit,
            value: this.web3.utils.toWei(value, unit),
          });
          await contract.methods[abi.name](...payload);
          const txReceipt = abi.name
            ? await contract.methods[abi.name](...payload).send({
              from: this.web3.eth.defaultAccount,
              gas: gaslimit,
              value: this.web3.utils.toWei(value, unit),
            })
            : null;
          this.printReceipt(txReceipt)
          //this.print(JSON.stringify(txReceipt));
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
