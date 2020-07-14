import { Folder } from "./type";
import { CommandPlugin } from "@remixproject/engine-vscode";

const profile = {
  name: "fileManager",
  displayName: "Native Filemanager for Remix vscode plugin",
  description: "Provides communication between vscode filemanager and remix-plugin",
  kind: "filemanager",
  permission: true,
  location: "sidePanel",
  documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: ["getFolder", "getCurrentFile", "getFile", "switchFile"],
};

export default class FileManagerPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  getFolder(path: string): Folder {
    const fd: Folder = {};
    return fd;
  }
  getCurrentFile(): string {
    return "";
  }
  getFile(path: string): string {
    const greeter: string = `pragma solidity >=0.5.0 <0.6.0;
    import "../mortal/mortal.sol";
    
    contract Greeter is Mortal {
        /* Define variable greeting of the type string */
        string greeting;
    
        /* This runs when the contract is executed */
        constructor(string memory _greeting) public {
            greeting = _greeting;
        }
    
        /* Main function */
        function greet() public view returns (string memory) {
            return greeting;
        }
    }`;
    return greeter;
  }
  setFile(path: string, content: string): void {
    return;
  }
  switchFile(path: string): void {
    return;
  }
}
