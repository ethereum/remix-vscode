import { CommandPlugin } from "@remixproject/engine-vscode";

export default class NativePlugin extends CommandPlugin {
  constructor() {
    super({ name: "native-plugin", methods: ["getVersion"] });
  }
  getVersion() {
    return 0.1;
  }
}
