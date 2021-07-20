"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const engine_1 = require("@remixproject/engine");
const remix_solidity_1 = require("@remix-project/remix-solidity");
const remix_lib_1 = require("@remix-project/remix-lib");
const ethutil = require('ethereumjs-util');
const profile = {
    name: 'fetchAndCompile',
    methods: ['resolve'],
    version: '0.0.1'
};
class FetchAndCompile extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.unresolvedAddresses = [];
        this.sourceVerifierNetWork = ['Main', 'Rinkeby', 'Ropsten', 'Goerli'];
    }
    /**
     * Fetch compiliation metadata from source-Verify from a given @arg contractAddress - https://github.com/ethereum/source-verify
     * Put the artifacts in the file explorer
     * Compile the code using Solidity compiler
     * Returns compilation data
     *
     * @param {string} contractAddress - Address of the contrac to resolve
     * @param {string} deployedBytecode - deployedBytecode of the contract
     * @param {string} targetPath - Folder where to save the compilation arfefacts
     * @return {CompilerAbstract} - compilation data targeting the given @arg contractAddress
     */
    resolve(contractAddress, codeAtAddress, targetPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            contractAddress = ethutil.toChecksumAddress(contractAddress);
            const localCompilation = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return (yield this.call('compilerArtefacts', 'get', contractAddress)) ? yield this.call('compilerArtefacts', 'get', contractAddress) : (yield this.call('compilerArtefacts', 'get', '__last')) ? yield this.call('compilerArtefacts', 'get', '__last') : null; });
            const resolved = yield this.call('compilerArtefacts', 'get', contractAddress);
            if (resolved)
                return resolved;
            if (this.unresolvedAddresses.includes(contractAddress))
                return localCompilation();
            // sometimes when doing an internal call, the only available artifact is the Solidity interface.
            // resolving addresses of internal call would allow to step over the source code, even if the declaration was made using an Interface.
            let network;
            try {
                network = yield this.call('network', 'detectNetwork');
            }
            catch (e) {
                return localCompilation();
            }
            if (!network)
                return localCompilation();
            if (!this.sourceVerifierNetWork.includes(network.name))
                return localCompilation();
            // check if the contract if part of the local compilation result
            const compilation = yield localCompilation();
            if (compilation) {
                let found = false;
                compilation.visitContracts((contract) => {
                    found = remix_lib_1.util.compareByteCode('0x' + contract.object.evm.deployedBytecode.object, codeAtAddress);
                    return found;
                });
                if (found) {
                    yield this.call('compilerArtefacts', 'addResolvedContract', contractAddress, compilation);
                    setTimeout(_ => this.emit('usingLocalCompilation', contractAddress), 0);
                    return compilation;
                }
            }
            let name = network.name.toLowerCase();
            name = name === 'main' ? 'mainnet' : name; // source-verifier api expect "mainnet" and not "main"
            let data;
            try {
                data = yield this.call('source-verification', 'fetchByNetwork', contractAddress, name.toLowerCase());
            }
            catch (e) {
                setTimeout(_ => this.emit('notFound', contractAddress), 0); // plugin framework returns a time out error although it actually didn't find the source...
                this.unresolvedAddresses.push(contractAddress);
                return localCompilation();
            }
            if (!data || !data.metadata) {
                setTimeout(_ => this.emit('notFound', contractAddress), 0);
                this.unresolvedAddresses.push(contractAddress);
                return localCompilation();
            }
            // set the solidity contract code using metadata
            yield this.call('fileManager', 'setFile', `${targetPath}/${name}/${contractAddress}/metadata.json`, JSON.stringify(data.metadata, null, '\t'));
            const compilationTargets = {};
            for (let file in data.metadata.sources) {
                const urls = data.metadata.sources[file].urls;
                for (const url of urls) {
                    if (url.includes('ipfs')) {
                        const stdUrl = `ipfs://${url.split('/')[2]}`;
                        const source = yield this.call('contentImport', 'resolve', stdUrl);
                        if (yield this.call('contentImport', 'isExternalUrl', file)) {
                            // nothing to do, the compiler callback will handle those
                        }
                        else {
                            file = file.replace('browser/', ''); // should be fixed in the remix IDE end.
                            const path = `${targetPath}/${name}/${contractAddress}/${file}`;
                            yield this.call('fileManager', 'setFile', path, source.content);
                            compilationTargets[path] = { content: source.content };
                        }
                        break;
                    }
                }
            }
            // compile
            const settings = {
                version: data.metadata.compiler.version,
                language: data.metadata.language,
                evmVersion: data.metadata.settings.evmVersion,
                optimize: data.metadata.settings.optimizer.enabled,
                runs: data.metadata.settings.runs
            };
            try {
                setTimeout(_ => this.emit('compiling', settings), 0);
                const compData = yield remix_solidity_1.compile(compilationTargets, settings, (url, cb) => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield this.call('contentImport', 'resolveAndSave', url).then((result) => cb(null, result)).catch((error) => cb(error.message)); }));
                yield this.call('compilerArtefacts', 'addResolvedContract', contractAddress, compData);
                return compData;
            }
            catch (e) {
                this.unresolvedAddresses.push(contractAddress);
                setTimeout(_ => this.emit('compilationFailed'), 0);
                return localCompilation();
            }
        });
    }
}
exports.FetchAndCompile = FetchAndCompile;
//# sourceMappingURL=compiler-fetch-and-compile.js.map