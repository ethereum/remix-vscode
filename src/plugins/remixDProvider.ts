import { Plugin } from "@remixproject/engine";
import { OutputChannel, window, workspace } from "vscode";
const remixd = require("@remix-project/remixd");

const profile = {
  name: "remixdprovider",
  displayName: "remixdprovider",
  description: "",
  icon: "assets/img/fileManager.webp",
  version: "0.0.1",
  methods: ["connect", "disconnect", "sendAsync", "debug"],
  events: [
    "connect",
    "disconnect",
    "displayUri",
    "accountsChanged",
    "chainChanged",
    "statusChanged",
  ],
  kind: "provider",
};

export type remixdStatus = "connected" | "disconnected";

export default class RemixDProvider extends Plugin {
  provider: any;
  sharedFolderClient: any;
  services: any;
  socket: any;
  status: remixdStatus;
  remixIdeUrl = "https://remix.ethereum.org/";

  ports = {
    git: 65521,
    folder: 65520,
  };

  constructor() {
    super(profile);
  }

  async createClient() {
    this.sharedFolderClient = new remixd.services.sharedFolder();
    this.createProvider();
    this.services = {
      folder: () => {
        this.sharedFolderClient.options.customApi = {};
        return this.sharedFolderClient;
      },
    };

    this.sharedFolderClient
      .onload()
      .then(async (x) => {
        console.log("LOADED");
        await this.setProvider();
        await this.getAccounts();
        this.status = "connected";
        this.emit("statusChanged", this.status);
      })
      .catch(async (e) => {
        console.log("ERROR CONNECTING", e);
        await this.call("terminal","log", `Connect to Remix`);
      });
  }

  async startService(service, callback) {
    try {
      await this.call("terminal","log", `starting service on ${this.remixIdeUrl}`);
      this.socket = new remixd.Websocket(
        this.ports[service],
        { remixIdeUrl: this.remixIdeUrl },
        () => this.services[service]()
      );
      this.socket.start(callback);
    } catch (e) {
      console.error(e);
    }
  }

  async start() {
    console.log("START");
    await this.createClient();
    const currentFolder = workspace.workspaceFolders[0].uri.fsPath;
    if (this.status == "connected") {
      await this.setProvider();
      return;
    }

    this.startService("folder", async (ws, client) => {
      const self = this;

      console.log("START SERVICE", client);
      client.setWebSocket(ws);
      client.sharedFolder(currentFolder, false);
      client.setupNotifications(currentFolder);
      client.websocket.onclose = async function () {
        await self.call("terminal","log", "Connection to Remix is closed now.");
        await self.disconnect();
      };
      await this.call("terminal","log", `Connected to Remix`)
      //await this.createProvider();

      //this.status = "connected";
      //this.emit("statusChanged", this.status);
    });
    await this.call("terminal","log", (
      `Connecting to Remix ... please go to ${this.remixIdeUrl} to connect to localhost in the File Explorer.`
    );
  }

  async createProvider() {
    console.log("create provider");
    let self = this;
    this.provider = {
      async sendAsync(payload, callback) {
        try {
          const result = await self.sharedFolderClient.call(
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
  }

  async setProvider() {
    console.log("set provider");
    await this.call("web3Provider", "setProvider", this.provider);
    //
    //await this.getAccounts();
    await this.setListeners();
  }

  async getAccounts() {
    await this.call("terminal","log", "Getting accounts");
    this.call("udapp" as any, "getAccounts");
  }

  async setListeners() {}

  async connect(network: any | undefined) {
    if (network !== this.remixIdeUrl) {
      await this.disconnect();

      this.remixIdeUrl = network;
    }
    await this.start();
    //await this.createProvider();
    //this.emit("connect")
  }

  async disconnect() {
    console.log("DISCONNECT");
    //await this.call("web3Provider", "disconnect");
    //console.log(this.sharedFolderClient.websocket);

    try {
      //await this.sharedFolderClient.call("manager", "deactivatePlugin", "remixd");
      this.socket.close();
    } catch (error) {
      //console.log(error);
    }
    await this.call("terminal","log", (`Disconnected`);
    this.emit("disconnect");
    this.status = "disconnected";
    //this.emit("statusChanged", this.status);
  }

  async debug(hash: string) {
    await this.sharedFolderClient.call("manager", "activatePlugin", "debugger");
    await this.sharedFolderClient.call("menuicons", "select", "debugger");
    await this.sharedFolderClient.call("debugger", "debug", hash);
  }

  sendAsync = (data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      if (this.provider) {
        this.provider.sendAsync(data, (error, message) => {
          if (error) return reject(error);
          resolve(message);
        });
      } else {
        return reject("Provider not loaded");
      }
    });
  };
}
