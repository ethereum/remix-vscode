"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3VmProvider_1 = require("./web3VmProvider");
const init_1 = require("../init");
class Web3Providers {
    constructor() {
        this.modes = {};
    }
    addProvider(type, obj) {
        if (type === 'INTERNAL') {
            const web3 = init_1.loadWeb3();
            this.addWeb3(type, web3);
        }
        else if (type === 'vm') {
            this.addVM(type, obj);
        }
        else {
            init_1.extendWeb3(obj);
            this.addWeb3(type, obj);
        }
    }
    get(type, cb) {
        if (this.modes[type]) {
            return cb(null, this.modes[type]);
        }
        cb('error: this provider has not been setup (' + type + ')', null);
    }
    addWeb3(type, web3) {
        this.modes[type] = web3;
    }
    addVM(type, vm) {
        const vmProvider = new web3VmProvider_1.Web3VmProvider();
        vmProvider.setVM(vm);
        this.modes[type] = vmProvider;
    }
}
exports.Web3Providers = Web3Providers;
//# sourceMappingURL=web3Providers.js.map