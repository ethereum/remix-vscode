import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, OutputChannel, workspace } from "vscode";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import { ISources } from "./type";

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

interface ICompilationResult {
  source: {
    target: string;
    sources: ISources;
  };
  data: any;
}

export default class NativeSolcPlugin extends CommandPlugin {
  private version: string = 'latest';
  private outputChannel: OutputChannel;
  private compilationResult: ICompilationResult;
  constructor() {
    super(profile);
    this.outputChannel = window.createOutputChannel("Remix IDE");
  }
  getVersion() {
    return 0.1;
  }
  private createWorker(): ChildProcess {
    // enable --inspect for debug
    // return fork(path.join(__dirname, "compile_worker.js"), [], {
    //   execArgv: ["--inspect=" + (process.debugPort + 1)]
    // });
    return fork(path.join(__dirname, "compile_worker.js"));
  }
  private getNow(): string {
    const date = new Date(Date.now());
    return date.toLocaleTimeString();
  }
  private print(m: string) {
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }
  async compile() {
    this.print("Compilation started!")
    const fileName = await this.call('fileManager', 'getCurrentFile')
    this.print(`Compiling ${fileName} ...`);
    const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
    const sources: ISources = {};
    if (fileName) {
      sources[fileName] = {
        content: editorContent,
      };
    }
    const solcWorker = this.createWorker();
    console.log(`Solidity compiler invoked with WorkerID: ${solcWorker.pid}`);
    console.log(`Compiling with solidity version ${this.version}`);
    var input = {
      language: "Solidity",
      sources,
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    };
    solcWorker.send({
      command: "compile",
      root: workspace.workspaceFolders[0].uri.fsPath,
      payload: input,
      version: this.version,
    });
    solcWorker.on("message", (m: any) => {
      console.log(`............................Solidity worker message............................`);
      console.log(m);
      if (m.error) {
        this.print(m.error);
        console.error(m.error);
      } else if (m.data && m.path) {
        sources[m.path] = {
          content: m.data.content,
        };
        solcWorker.send({
          command: "compile",
          root: workspace.workspaceFolders[0].uri.fsPath,
          payload: input,
          version: this.version,
        });
      } else if (m.compiled) {
        const languageVersion = this.version;
        const compiled = JSON.parse(m.compiled);
        if(compiled.errors) {
          this.print(`Compilation error while compiling ${fileName} with solidity version ${languageVersion}.`);
          this.print(`${JSON.stringify(compiled.errors)}`);
        }
        if(compiled.contracts) {
          const source = { sources };
          const data = JSON.parse(m.compiled);
          this.compilationResult = {
            source: {
              sources,
              target: fileName
            },
            data
          }
          this.print(`Compilation finished for ${fileName} with solidity version ${languageVersion}.`);
          this.emit('compilationFinished', fileName, source, languageVersion, data);
        }
      }
    })
  }
  getCompilationResult() {
    return this.compilationResult;
  }
}