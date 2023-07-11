'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tx_1 = require("@ethereumjs/tx");
const block_1 = require("@ethereumjs/block");
const ethereumjs_util_1 = require("ethereumjs-util");
const eventManager_1 = require("../eventManager");
const logsManager_1 = require("./logsManager");
class TxRunnerVM {
    constructor(vmaccounts, api, getVMObject) {
        this.event = new eventManager_1.EventManager();
        this.logsManager = new logsManager_1.LogsManager();
        // has a default for now for backwards compatability
        this.getVMObject = getVMObject;
        this.commonContext = this.getVMObject().common;
        this.blockNumber = 0;
        this.runAsync = true;
        this.blockNumber = 0; // The VM is running in Homestead mode, which started at this block.
        this.runAsync = false; // We have to run like this cause the VM Event Manager does not support running multiple txs at the same time.
        this.pendingTxs = {};
        this.vmaccounts = vmaccounts;
        this.queusTxs = [];
        this.blocks = [];
    }
    execute(args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
        let data = args.data;
        if (data.slice(0, 2) !== '0x') {
            data = '0x' + data;
        }
        try {
            this.runInVm(args.from, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, callback);
        }
        catch (e) {
            callback(e, null);
        }
    }
    runInVm(from, to, data, value, gasLimit, useCall, timestamp, callback) {
        const self = this;
        const account = self.vmaccounts[from];
        if (!account) {
            return callback('Invalid account selected');
        }
        if (Number.isInteger(gasLimit)) {
            gasLimit = '0x' + gasLimit.toString(16);
        }
        this.getVMObject().stateManager.getAccount(ethereumjs_util_1.Address.fromString(from)).then((res) => {
            // See https://github.com/ethereumjs/ethereumjs-tx/blob/master/docs/classes/transaction.md#constructor
            // for initialization fields and their types
            if (!value)
                value = 0;
            if (typeof value === 'string') {
                if (value.startsWith('0x'))
                    value = new ethereumjs_util_1.BN(value.replace('0x', ''), 'hex');
                else {
                    try {
                        value = new ethereumjs_util_1.BN(value, 10);
                    }
                    catch (e) {
                        return callback('Unable to parse the value ' + e.message);
                    }
                }
            }
            const EIP1559 = this.commonContext.hardfork() !== 'berlin';
            let tx;
            if (!EIP1559) {
                tx = tx_1.Transaction.fromTxData({
                    nonce: new ethereumjs_util_1.BN(res.nonce),
                    gasPrice: '0x1',
                    gasLimit: gasLimit,
                    to: to,
                    value: value,
                    data: Buffer.from(data.slice(2), 'hex')
                }, { common: this.commonContext }).sign(account.privateKey);
            }
            else {
                tx = tx_1.FeeMarketEIP1559Transaction.fromTxData({
                    nonce: new ethereumjs_util_1.BN(res.nonce),
                    maxPriorityFeePerGas: '0x01',
                    maxFeePerGas: '0x1',
                    gasLimit: gasLimit,
                    to: to,
                    value: value,
                    data: Buffer.from(data.slice(2), 'hex')
                }).sign(account.privateKey);
            }
            const coinbases = ['0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a', '0x8945a1288dc78a6d8952a92c77aee6730b414778', '0x94d76e24f818426ae84aa404140e8d5f60e10e7e'];
            const difficulties = [new ethereumjs_util_1.BN('69762765929000', 10), new ethereumjs_util_1.BN('70762765929000', 10), new ethereumjs_util_1.BN('71762765929000', 10)];
            var block = block_1.Block.fromBlockData({
                header: {
                    timestamp: timestamp || (new Date().getTime() / 1000 | 0),
                    number: self.blockNumber,
                    coinbase: coinbases[self.blockNumber % coinbases.length],
                    difficulty: difficulties[self.blockNumber % difficulties.length],
                    gasLimit: new ethereumjs_util_1.BN(gasLimit.replace('0x', ''), 16).imuln(2),
                    baseFeePerGas: EIP1559 ? '0x1' : undefined
                },
                transactions: [tx]
            }, { common: this.commonContext });
            if (!useCall) {
                ++self.blockNumber;
                this.runBlockInVm(tx, block, callback);
            }
            else {
                this.getVMObject().stateManager.checkpoint().then(() => {
                    this.runBlockInVm(tx, block, (err, result) => {
                        this.getVMObject().stateManager.revert().then(() => {
                            callback(err, result);
                        });
                    });
                });
            }
        }).catch((e) => {
            callback(e);
        });
    }
    runBlockInVm(tx, block, callback) {
        this.getVMObject().vm.runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }).then((results) => {
            const result = results.results[0];
            if (result) {
                const status = result.execResult.exceptionError ? 0 : 1;
                result.status = `0x${status}`;
            }
            callback(null, {
                result: result,
                transactionHash: ethereumjs_util_1.bufferToHex(Buffer.from(tx.hash())),
                block,
                tx
            });
        }).catch(function (err) {
            callback(err);
        });
    }
}
exports.TxRunnerVM = TxRunnerVM;
//# sourceMappingURL=txRunnerVM.js.map