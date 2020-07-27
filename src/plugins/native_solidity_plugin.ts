import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, workspace, Uri } from "vscode";

const profile = {
  name: 'solidity',
  displayName: 'Solidity compiler',
  description: 'Compile solidity contracts',
  kind: 'compiler',
  permission: true,
  location: 'sidePanel',
  documentation: 'https://remix-ide.readthedocs.io/en/latest/solidity_editor.html',
  version: '0.0.1',
  methods: ['getCompilationResult', 'compile', 'compileWithParameters', 'setCompilerConfig']
};

export default class NativeSolcPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  getVersion() {
    return 0.1;
  }
  compile() {
    console.log("Will emit compilationFinished");
    const fileName = window.activeTextEditor ? window.activeTextEditor.document.fileName : undefined;
    this.emit('compilationFinished', fileName);
  }
}
