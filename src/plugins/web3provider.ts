import { Plugin } from "@remixproject/engine";

export const profile = {
  name: "web3Provider",
  displayName: "Global Web3 Provider",
  description:
    "Represent the current web3 provider used by the app at global scope",
  methods: ["sendAsync", "setProvider", "disconnect"],
  version: "0.0.1",
  kind: "provider",
};

export class Web3ProviderModule extends Plugin {
	web3Provider: any;
  constructor() {
    super(profile);
  }

  setProvider(provider: any){
    this.web3Provider = provider
  }

  disconnect(){
    try{
      delete this.web3Provider
    }catch(e){
      console.log(e)
    }
  }

  sendAsync(payload: any) {
    return new Promise((resolve, reject) => {
      this.web3Provider[
        this.web3Provider.sendAsync ? "sendAsync" : "send"
      ](payload, (error, message) => {
        if (error) return reject(error);
        resolve(message);
      });
    });
  }
}
