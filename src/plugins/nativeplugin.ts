import { Plugin } from "@remixproject/engine";

export default class NativePlugin extends Plugin {
  constructor() {
    super({ name: "native-plugin", methods: ["getVersion"] });
  }
  getVersion() {
    return 0.1;
  }
}
