import { Plugin } from "@remixproject/engine";
import Web3 from "web3";

export const profile = {
  name: "network",
  description:
    "Manage the network (mainnet, ropsten, goerli...) and the provider (web3, vm, injected)",
  methods: [
    "getNetworkProvider",
    "getEndpoint",
    "detectNetwork",
    "addNetwork",
    "removeNetwork",
  ],
  version: "0.0.1",
  kind: "network",
};

// Network API has :
// - events: ['providerChanged']
// - methods: ['getNetworkProvider', 'getEndpoint', 'detectNetwork', 'addNetwork', 'removeNetwork']

export class NetworkModule extends Plugin {
  private web3Provider;
  private web3: Web3;
  private networkName: string;
  constructor() {
    super(profile);
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
  }

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

  /** Return the current network provider (web3, vm, injected) */
  getNetworkProvider() {
    return this.web3Provider;
  }

  /** Return the current network */
  async detectNetwork() {
    
      await this.web3.eth.net.getId((err, id) => {
        this.networkName = null;
        if (err) {
          this.print(`Could not detect network! Please connnect.`);
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

      return {name:this.networkName}

  }

  

  /** Return the url only if network provider is 'web3' */
  getEndpoint() {}

  /** Add a custom network to the list of available networks */
  addNetwork(network) {
    // { name, url }
    this.print(`Adding network ${network}`);
    let networkprovider = new Web3.providers.HttpProvider(network);
    this.call("web3Provider", "setProvider", networkprovider);
  }

  /** Remove a network to the list of availble networks */
  removeNetwork(name) {}


  private print(m: string) {
    this.call("terminal", "log", m);
  }
}
