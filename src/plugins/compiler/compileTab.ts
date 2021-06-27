import { Compiler, EVMVersion, urlFromVersion } from "@remix-project/remix-solidity";
import { Plugin } from "@remixproject/engine";

const profile = {
  name: "solidity-logic",
  displayName: "Solidity compiler logic",
  description: "Compile solidity contracts - Logic",
  version: "0.0.1",
  methods: ["compile"],
};

export default class CompileTab extends Plugin {
  compiler: Compiler;
  optimize: boolean;
  runs: any;
  evmVersion: EVMVersion;
  constructor() {
    super(profile);
    this.compiler = new Compiler(async (url, cb) => {
      try {
        const result = await this.call(
          "contentImport",
          "resolveAndSave",
          url,
          ""
        );
        cb(null, result);
      } catch (e) {
        cb(e.message);
      }
    });
    this.init();
  }

  init() {
    this.optimize = true;
    this.compiler.set("optimize", this.optimize);

    this.runs = this.runs || 200;
    this.compiler.set("runs", this.runs);

    this.evmVersion = null;
    this.compiler.set("evmVersion", this.evmVersion);
    console.log("COMPILER")
    console.log(this.compiler)
  }

  /**
   * Compile a specific file of the file manager
   * @param {string} target the path to the file to compile
   */
  async compile(target) {
    if (!target) throw new Error("No target provided for compiliation");
    let content = await this.call("fileManager", "readFile", target);
    const sources = { [target]: { content } };
    console.log(sources)

    this.compiler.loadRemoteVersion('https://binaries.soliditylang.org/wasm/soljson-v0.8.4+commit.c7e474f2.js')
    //this.compiler.loadVersion(false, urlFromVersion('0.8.4'))
    this.compiler.event.register('compilationFinished', (success, compilationData, source) => {
      console.log(compilationData)
    })
    this.compiler.event.register('compilerLoaded', _ => {
      console.log("loaded")
    }) //this.compiler.compile(sources, target))
  }
}
