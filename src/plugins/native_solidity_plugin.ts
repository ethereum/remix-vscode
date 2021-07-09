import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, OutputChannel, workspace, commands } from "vscode";
import { fork, ChildProcess } from "child_process";
import * as path from "path";
import { ISources, CompilerInput, CompilerInputOptions } from "../types";
import { relativePath } from "@remixproject/engine-vscode/util/path";
import {
  gatherImportsCallbackInterface,
  Source,
} from "@remix-project/remix-solidity";

const semver = require("semver");
const profile = {
  name: "solidity",
  displayName: "Solidity compiler",
  description: "Compile solidity contracts",
  kind: "compiler",
  permission: true,
  location: "sidePanel",
  documentation:
    "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: [
    "getCompilationResult",
    "compile",
    "compileWithParameters",
    "setCompilerConfig",
  ],
};

interface ICompilationResult {
  source: {
    target: string;
    sources: ISources;
  };
  data: any;
}

export default class NativeSolcPlugin extends CommandPlugin {
  private version: string = "latest";
  private versions: Array<string>;
  private compilationResult: ICompilationResult;
  private compilerOpts: CompilerInputOptions
  constructor() {
    super(profile);
    this.loadSolidityVersions();
    this.compilerOpts = {
      language: "Solidity",
      optimize: false,
      runs: 200,
    };
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
  private print(m: string) {
    this.call("terminal", "log", m);
  }

  handleImportCall = (url, cb) => {
    this.call("contentImport", "resolveAndSave", url, "")
      .then((result) => cb(null, result))
      .catch((error) => cb(error.message));
  };
  /**
   * @dev Gather imports for compilation
   * @param files file sources
   * @param importHints import file list
   * @param cb callback
   */

  gatherImports(
    files: Source,
    importHints?: string[],
    cb?: gatherImportsCallbackInterface
  ): void {
    console.log("gather imports", files, importHints);
    importHints = importHints || [];
    // FIXME: This will only match imports if the file begins with one '.'
    // It should tokenize by lines and check each.
    const importRegex = /^\s*import\s*['"]([^'"]+)['"];/g;
    for (const fileName in files) {
      let match: RegExpExecArray | null;
      while ((match = importRegex.exec(files[fileName].content))) {
        let importFilePath = match[1];
        if (importFilePath.startsWith("./")) {
          const path: RegExpExecArray | null = /(.*\/).*/.exec(fileName);
          importFilePath = path
            ? importFilePath.replace("./", path[1])
            : importFilePath.slice(2);
        }
        if (!importHints.includes(importFilePath))
          importHints.push(importFilePath);
      }
    }
    while (importHints.length > 0) {
      const m: string = importHints.pop() as string;
      if (m && m in files) continue;

      if (this.handleImportCall) {
        this.handleImportCall(m, (err, content: string) => {
          if (err && cb) cb(err);
          else {
            files[m] = { content };
            this.gatherImports(files, importHints, cb);
          }
        });
      }
      return;
    }
    if (cb) {
      cb(null, { sources: files });
    }
  }

  async compile(_version: string, opts: CompilerInputOptions, file?: string) {
    this.print("Compilation started with !");
    const fileName = file || (await this.call("fileManager", "getCurrentFile"));
    let versionFromPragma;
    try{
      versionFromPragma = await this._setCompilerVersionFromPragma(fileName)
    }catch{
      versionFromPragma = 'latest'
    }
    this.version = _version ? (_version in this.versions ? this.versions[_version] : _version ): versionFromPragma
    
    this.compilerOpts = opts? opts:this.compilerOpts
    opts = this.compilerOpts
    
    this.print(`Compiling ${fileName} ...`);
    const editorContent = file
      ? await this.call("fileManager", "readFile", file)
      : undefined || window.activeTextEditor
      ? window.activeTextEditor.document.getText()
      : undefined;
    const sources: ISources = {};
    if (fileName) {
      sources[fileName] = {
        content: editorContent,
      };
    }
    const solcWorker = this.createWorker();
    console.log(`Solidity compiler invoked with WorkerID: ${solcWorker.pid}`);
    this.print(`Compiling with version ${this.version}`);
    var input: CompilerInput = {
      language: opts.language,
      sources,
      settings: {
        outputSelection: {
          "*": {
            "": ["ast"],
            "*": [
              "abi",
              "metadata",
              "devdoc",
              "userdoc",
              "evm.legacyAssembly",
              "evm.bytecode",
              "evm.deployedBytecode",
              "evm.methodIdentifiers",
              "evm.gasEstimates",
              "evm.assembly",
            ],
          },
        },
        optimizer: {
          enabled: opts.optimize === true || opts.optimize === 1,
          runs: opts.runs || 200,
          details: {
            yul: Boolean(opts.language === "Yul" && opts.optimize),
          },
        },
        libraries: opts.libraries,
      },
    };
    if (opts.evmVersion) {
      input.settings.evmVersion = opts.evmVersion;
    }
    if (opts.language) {
      input.language = opts.language;
    }
    if (opts.language === "Yul" && input.settings.optimizer.enabled) {
      if (!input.settings.optimizer.details)
        input.settings.optimizer.details = {};
      input.settings.optimizer.details.yul = true;
    }
    console.clear();
    solcWorker.send({
      command: "compile",
      root: workspace.workspaceFolders[0].uri.fsPath,
      payload: input,
      version: this.version,
    });
    solcWorker.on("message", (m: any) => {
      console.log(
        `............................Solidity worker message............................`
      );
      if (m.error) {
        this.print(m.error);
        console.error(m.error);
      } else if (m.processMessage) {
        this.print(m.processMessage);
      } else if (m.data && m.path) {
        this.print(`Compiling ${m.path}...`);
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
        console.log("missing inputs", m);
        if (m.missingInputs && m.missingInputs.length > 0) {
          //return false
          console.log("gathering imports");
          this.gatherImports(m.sources, m.missingInputs, (error, files) => {

            console.log("FILES", files);

            input.sources = files.sources;
            solcWorker.send({
              command: "compile",
              root: workspace.workspaceFolders[0].uri.fsPath,
              payload: input,
              version: this.version,
            });
          
          });
        }
        if (compiled.errors) {
          //console.log(compiled.errors)
          // this.print(
          //   `Compilation error while compiling ${fileName} with solidity version ${m?.version}.`
          // );
          logError(compiled?.errors);
        }
        if (compiled.contracts) {
          console.log("COMPILED");
          const source = { sources, target: fileName };
          const data = JSON.parse(m.compiled);
          this.compilationResult = {
            source: {
              sources,
              target: fileName,
            },
            data,
          };
          const contracts = Object.keys(compiled.contracts).join(", ");
          this.print(
            `Compilation finished for ${contracts} with solidity version ${m?.version}.`
          );
          this.emit(
            "compilationFinished",
            fileName,
            source,
            languageVersion,
            data
          );
        }
      }
    });

    const errorKeysToLog = ["formattedMessage"];
    const logError = (errors: any[]) => {
      for (let i in errors) {
        if (["number", "string"].includes(typeof errors[i])) {
          if (
            errorKeysToLog.includes(i) &&
            !errors[i].includes("Deferred import")
          )
            this.print(errors[i]);
        } else {
          logError(errors[i]);
        }
      }
    };
  }

  async compileWithSolidityExtension() {
    commands
      .executeCommand("solidity.compile.active")
      .then(async (listOFiles: string[]) => {
        if (listOFiles)
          for (let file of listOFiles) {
            await this.parseSolcOutputFile(file);
          }
      });
  }

  async parseSolcOutputFile(file: string) {
    console.log(file);
    this.print(`Compiling with Solidity Extension`);
    const content = await this.call("fileManager", "readFile", file);
    const parsedContent = JSON.parse(content);
    const sourcePath = parsedContent.sourcePath;
    const solcOutput = `${path
      .basename(parsedContent.sourcePath)
      .split(".")
      .slice(0, -1)
      .join(".")}-solc-output.json`;
    const outputDir = path.dirname(file);
    let raw = await this.call(
      "fileManager",
      "readFile",
      `${outputDir}/${solcOutput}`
    );
    console.log(`${outputDir}/${solcOutput}`);
    const relativeFilePath = relativePath(sourcePath);
    var re = new RegExp(`${sourcePath}`, "gi");
    raw = raw.replace(re, relativeFilePath);
    const compiled = JSON.parse(raw);
    let source = {};
    const fileKeys = Object.keys(compiled.sources);
    for (let s of fileKeys) {
      source[s] = { content: await this.call("fileManager", "readFile", s) };
    }
    this.compilationResult = {
      source: {
        sources: source,
        target: relativeFilePath,
      },
      data: compiled,
    };
    this.print(
      `Compilation finished for ${relativeFilePath} with solidity version ${parsedContent?.compiler.version}.`
    );
    this.emit(
      "compilationFinished",
      relativeFilePath,
      { sources: source },
      parsedContent?.compiler.version,
      compiled
    );
  }

  getCompilationResult() {
    return this.compilationResult;
  }
  private loadSolidityVersions() {
    const solcWorker = this.createWorker();
    solcWorker.send({ command: "fetch_compiler_verison" });
    solcWorker.on("message", (m: any) => {
      this.versions = m.versions;
    });
  }
  getSolidityVersions() {
    return this.versions;
  }

  // Load solc compiler version according to pragma in contract file
  async _setCompilerVersionFromPragma(filename) {
    
    let data = await this.call("fileManager", "readFile", filename);
    let versionFound;
    const pragmaArr = data.match(/(pragma solidity (.+?);)/g);
    if (pragmaArr && pragmaArr.length === 1) {
      const pragmaStr = pragmaArr[0].replace("pragma solidity", "").trim();
      const pragma = pragmaStr.substring(0, pragmaStr.length - 1);

      console.log(pragma);
      
      //console.log(this.versions)
      for(let version of Object.keys(this.versions)){
        //console.log(version)
        if(semver.satisfies(version, pragma)){
          versionFound = this.versions[version]
        }
      }
    }
    return new Promise((resolve, reject)=>{
      if(versionFound){
        resolve(versionFound)
      }else{
        reject()
      }
    })
    
  }
}
