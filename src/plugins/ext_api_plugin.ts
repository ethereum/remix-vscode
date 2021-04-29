import { extensions, window } from "vscode";
import { CommandPlugin } from "@remixproject/engine-vscode";

const profile = {
  name: "vscodeExtAPI",
  displayName: "Extension API connector",
  description: "Connects VScode Extension API with remix plugins.",
  kind: "connector",
  permission: true,
  documentation:
    "",
  version: "0.0.1",
  methods: ["executeCommand"],
};
export class ExtAPIPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  async executeCommand(extName: string, cmdName: string, payload?: any[]) {
    try {
      const ext = extensions.getExtension(extName);
      await ext.activate();
      const extAPI = ext.exports;
      extAPI[cmdName](...payload || []);
    } catch (e) {
      // extension can not be activated or any other error
      console.error(e)
      window.showErrorMessage(`${extName} extension is not installed or disabled.`)
    }
  }
}
