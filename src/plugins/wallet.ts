import { Plugin } from "@remixproject/engine";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { OutputChannel, window } from "vscode";

const profile = {
  name: "walletconnect",
  displayName: "walletconnect",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["connect", "disconnect", "sendAsync"],
  events:["connect", "disconnect", "displayUri", "accountsChanged", "chainChanged"],
  kind: "provider",
};
export default class WalletConnect extends Plugin {
  private outputChannel: OutputChannel;
  provider: WalletConnectProvider;
  constructor() {
    super(profile);
    console.log("new wallet");
    this.outputChannel = window.createOutputChannel("Remix IDE");
  }

  async createProvider() {
    this.provider = new WalletConnectProvider({
      infuraId: "83d4d660ce3546299cbe048ed95b6fad",
      bridge: "https://static.225.91.181.135.clients.your-server.de",
      qrcode: false,
      clientMeta: {
        description: "Remix Extension",
        url: "https://remix.ethereum.org",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "Remix Extension",
      },
    });
    await this.setListeners()
  }

  async setListeners() {
    this.provider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      console.log(uri);
      this.print(`Connect to wallet with URI: ${uri}`)
      this.emit('displayUri', uri)
      //this.call("walletconnect" as any, "qr", uri);
    });

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      for(const account of accounts){
        this.print(`Wallet account : ${account}`)
      }
      this.emit('accountsChanged', accounts || [])
      //this.call("walletconnect" as any, "dismiss");
      //this.provider.disconnect();
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", (chainId: number) => {
      this.print(`Wallet chain changed : ${chainId}`)
      this.emit("chainChanged", chainId)
      console.log(chainId);
    });

    // Subscribe to session disconnection
    this.provider.on("disconnect", (code: number, reason: string) => {
      this.emit("disconnect")
      this.print(`Disconnected from wallet`)
      console.log(code, reason);
    });
  }

  async connect() {
    console.log("connect");
    await this.createProvider()

    await this.provider.enable();
    this.print(`Connected to wallet`)
    this.emit("connect")
  }

  async disconnect(){
    console.log("disconnect")

    await this.provider.disconnect();
    await this.provider.close()
    this.print(`Disconnected from wallet`)
    this.emit("disconnect")
  }

  // terminal printing
  private getNow(): string {
    const date = new Date(Date.now());
    return date.toLocaleTimeString();
  }

  private print(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }

  sendAsync = (data) => {
    return new Promise((resolve, reject) => {
      if (this.provider) {
        this.provider.sendAsync(data, (error, message) => {
          // console.log('in plugin', data, error, message)
          if (error) return reject(error);
          resolve(message);
        });
      } else {
        return reject("this.provider not loaded");
      }
    });
  };
}
