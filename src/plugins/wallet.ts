import { Plugin } from "@remixproject/engine";
import WalletConnectProvider from "@walletconnect/web3-provider";

const profile = {
  name: "wallet",
  displayName: "wallet",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["deploy", "sendAsync"],
  kind: "provider",
};
export default class Wallet extends Plugin {
  provider: WalletConnectProvider;
  constructor() {
    super(profile);
    console.log("new wallet");
    this.provider = new WalletConnectProvider({
      infuraId: "83d4d660ce3546299cbe048ed95b6fad",
      bridge: "https://static.225.91.181.135.clients.your-server.de",
      qrcode: false,
      clientMeta: {
        description: "Vscode Remix",
        url: "https://remix.ethereum.org",
        icons: ["https://walletconnect.org/walletconnect-logo.png"],
        name: "vscode",
      },
    });

    this.provider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      //console.log(uri);
      this.call("walletconnect" as any, "qr", uri);
    });

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
      this.call("walletconnect" as any, "dismiss");
      //this.provider.disconnect();
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to session disconnection
    this.provider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);
    });
  }

  async connect() {
    console.log("connect");

    await this.provider.enable();
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
