'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const engine_1 = require("@remixproject/engine");
const remix_solidity_1 = require("@remix-project/remix-solidity");
const profile = {
    name: 'compilerMetadata',
    methods: ['deployMetadataOf'],
    events: [],
    version: '0.0.1'
};
class CompilerMetadata extends engine_1.Plugin {
    constructor() {
        super(profile);
        this.networks = ['VM:-', 'main:1', 'ropsten:3', 'rinkeby:4', 'kovan:42', 'görli:5', 'Custom'];
        this.innerPath = 'artifacts';
    }
    _JSONFileName(path, contractName) {
        return this.joinPath(path, this.innerPath, contractName + '.json');
    }
    _MetadataFileName(path, contractName) {
        return this.joinPath(path, this.innerPath, contractName + '_metadata.json');
    }
    onActivation() {
        var self = this;
        this.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!(yield this.call('settings', 'get', 'settings/generate-contract-metadata')))
                return;
            const compiler = new remix_solidity_1.CompilerAbstract(languageVersion, data, source);
            var path = self._extractPathOf(source.target);
            compiler.visitContracts((contract) => {
                if (contract.file !== source.target)
                    return;
                (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const fileName = self._JSONFileName(path, contract.name);
                    const content = (yield this.call('fileManager', 'exists', fileName)) ? yield this.call('fileManager', 'readFile', fileName) : null;
                    yield this._setArtefacts(content, contract, path);
                }))();
            });
        }));
    }
    _extractPathOf(file) {
        var reg = /(.*)(\/).*/;
        var path = reg.exec(file);
        return path ? path[1] : '/';
    }
    _setArtefacts(content, contract, path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            content = content || '{}';
            var metadata;
            try {
                metadata = JSON.parse(content);
            }
            catch (e) {
                console.log(e);
            }
            var fileName = this._JSONFileName(path, contract.name);
            var metadataFileName = this._MetadataFileName(path, contract.name);
            var deploy = metadata.deploy || {};
            this.networks.forEach((network) => {
                deploy[network] = this._syncContext(contract, deploy[network] || {});
            });
            let parsedMetadata;
            try {
                parsedMetadata = JSON.parse(contract.object.metadata);
            }
            catch (e) {
                console.log(e);
            }
            if (parsedMetadata)
                yield this.call('fileManager', 'writeFile', metadataFileName, JSON.stringify(parsedMetadata, null, '\t'));
            var data = {
                deploy,
                data: {
                    bytecode: contract.object.evm.bytecode,
                    deployedBytecode: contract.object.evm.deployedBytecode,
                    gasEstimates: contract.object.evm.gasEstimates,
                    methodIdentifiers: contract.object.evm.methodIdentifiers
                },
                abi: contract.object.abi
            };
            yield this.call('fileManager', 'writeFile', fileName, JSON.stringify(data, null, '\t'));
        });
    }
    _syncContext(contract, metadata) {
        var linkReferences = metadata.linkReferences;
        var autoDeployLib = metadata.autoDeployLib;
        if (!linkReferences)
            linkReferences = {};
        if (autoDeployLib === undefined)
            autoDeployLib = true;
        for (var libFile in contract.object.evm.bytecode.linkReferences) {
            if (!linkReferences[libFile])
                linkReferences[libFile] = {};
            for (var lib in contract.object.evm.bytecode.linkReferences[libFile]) {
                if (!linkReferences[libFile][lib]) {
                    linkReferences[libFile][lib] = '<address>';
                }
            }
        }
        metadata.linkReferences = linkReferences;
        metadata.autoDeployLib = autoDeployLib;
        return metadata;
    }
    deployMetadataOf(contractName, fileLocation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let path;
            if (fileLocation) {
                path = fileLocation.split('/');
                path.pop();
                path = path.join('/');
            }
            else {
                try {
                    path = this._extractPathOf(yield this.call('fileManager', 'getCurrentFile'));
                }
                catch (err) {
                    console.log(err);
                    throw new Error(err);
                }
            }
            try {
                const { id, name } = yield this.call('network', 'detectNetwork');
                const fileName = this._JSONFileName(path, contractName);
                try {
                    const content = yield this.call('fileManager', 'readFile', fileName);
                    if (!content)
                        return null;
                    let metadata = JSON.parse(content);
                    metadata = metadata.deploy || {};
                    return metadata[name + ':' + id] || metadata[name] || metadata[id] || metadata[name.toLowerCase() + ':' + id] || metadata[name.toLowerCase()];
                }
                catch (err) {
                    return null;
                }
            }
            catch (err) {
                console.log(err);
                throw new Error(err);
            }
        });
    }
    joinPath(...paths) {
        paths = paths.filter((value) => value !== '').map((path) => path.replace(/^\/|\/$/g, '')); // remove first and last slash)
        if (paths.length === 1)
            return paths[0];
        return paths.join('/');
    }
}
exports.CompilerMetadata = CompilerMetadata;
//# sourceMappingURL=compiler-metadata.js.map