'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const web3_1 = tslib_1.__importDefault(require("web3"));
function loadWeb3(url = 'http://localhost:8545') {
    const web3 = new web3_1.default();
    web3.setProvider(new web3_1.default.providers.HttpProvider(url));
    this.extend(web3);
    return web3;
}
exports.loadWeb3 = loadWeb3;
function extendWeb3(web3) {
    this.extend(web3);
}
exports.extendWeb3 = extendWeb3;
function setProvider(web3, url) {
    web3.setProvider(new web3.providers.HttpProvider(url));
}
exports.setProvider = setProvider;
function web3DebugNode(network) {
    const web3DebugNodes = {
        Main: 'https://gethmainnet.komputing.org',
        Rinkeby: 'https://remix-rinkeby.ethdevops.io',
        Ropsten: 'https://remix-ropsten.ethdevops.io',
        Goerli: 'https://remix-goerli.ethdevops.io'
    };
    if (web3DebugNodes[network]) {
        return this.loadWeb3(web3DebugNodes[network]);
    }
    return null;
}
exports.web3DebugNode = web3DebugNode;
function extend(web3) {
    if (!web3.extend) {
        return;
    }
    // DEBUG
    const methods = [];
    if (!(web3.debug && web3.debug.preimage)) {
        methods.push(new web3.extend.Method({
            name: 'preimage',
            call: 'debug_preimage',
            inputFormatter: [null],
            params: 1
        }));
    }
    if (!(web3.debug && web3.debug.traceTransaction)) {
        methods.push(new web3.extend.Method({
            name: 'traceTransaction',
            call: 'debug_traceTransaction',
            inputFormatter: [null, null],
            params: 2
        }));
    }
    if (!(web3.debug && web3.debug.storageRangeAt)) {
        methods.push(new web3.extend.Method({
            name: 'storageRangeAt',
            call: 'debug_storageRangeAt',
            inputFormatter: [null, null, null, null, null],
            params: 5
        }));
    }
    if (methods.length > 0) {
        web3.extend({
            property: 'debug',
            methods: methods,
            properties: []
        });
    }
}
exports.extend = extend;
//# sourceMappingURL=init.js.map