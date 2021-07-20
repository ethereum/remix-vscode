'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const txHelper_1 = require("./txHelper");
class CompilerAbstract {
    constructor(languageversion, data, source) {
        this.languageversion = languageversion;
        this.data = data;
        this.source = source; // source code
    }
    getContracts() {
        return this.data.contracts;
    }
    getContract(name) {
        return txHelper_1.default.getContract(name, this.data.contracts);
    }
    visitContracts(calllback) {
        return txHelper_1.default.visitContracts(this.data.contracts, calllback);
    }
    getData() {
        return this.data;
    }
    getAsts() {
        return this.data.sources; // ast
    }
    getSourceName(fileIndex) {
        if (this.data && this.data.sources) {
            return Object.keys(this.data.sources)[fileIndex];
        }
        else if (Object.keys(this.source.sources).length === 1) {
            // if we don't have ast, we return the only one filename present.
            const sourcesArray = Object.keys(this.source.sources);
            return sourcesArray[0];
        }
        return null;
    }
    getSourceCode() {
        return this.source;
    }
}
exports.CompilerAbstract = CompilerAbstract;
//# sourceMappingURL=compiler-abstract.js.map