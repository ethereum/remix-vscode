'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eventManager_1 = require("../eventManager");
class TxRunnerWeb3 {
    constructor(api, getWeb3, currentblockGasLimit) {
        this.event = new eventManager_1.EventManager();
        this.getWeb3 = getWeb3;
        this.currentblockGasLimit = currentblockGasLimit;
        this._api = api;
    }
    _executeTx(tx, gasPrice, api, promptCb, callback) {
        if (gasPrice)
            tx.gasPrice = this.getWeb3().utils.toHex(gasPrice);
        if (api.personalMode()) {
            promptCb((value) => {
                this._sendTransaction(this.getWeb3().personal.sendTransaction, tx, value, callback);
            }, () => {
                return callback('Canceled by user.');
            });
        }
        else {
            this._sendTransaction(this.getWeb3().eth.sendTransaction, tx, null, callback);
        }
    }
    _sendTransaction(sendTx, tx, pass, callback) {
        const cb = (err, resp) => {
            if (err) {
                return callback(err, resp);
            }
            this.event.trigger('transactionBroadcasted', [resp]);
            var listenOnResponse = () => {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const receipt = yield tryTillReceiptAvailable(resp, this.getWeb3());
                    tx = yield tryTillTxAvailable(resp, this.getWeb3());
                    resolve({
                        receipt,
                        tx,
                        transactionHash: receipt ? receipt['transactionHash'] : null
                    });
                }));
            };
            listenOnResponse().then((txData) => { callback(null, txData); }).catch((error) => { callback(error); });
        };
        const args = pass !== null ? [tx, pass, cb] : [tx, cb];
        try {
            sendTx.apply({}, args);
        }
        catch (e) {
            return callback(`Send transaction failed: ${e.message} . if you use an injected provider, please check it is properly unlocked. `);
        }
    }
    execute(args, confirmationCb, gasEstimationForceSend, promptCb, callback) {
        let data = args.data;
        if (data.slice(0, 2) !== '0x') {
            data = '0x' + data;
        }
        return this.runInNode(args.from, args.to, data, args.value, args.gasLimit, args.useCall, args.timestamp, confirmationCb, gasEstimationForceSend, promptCb, callback);
    }
    runInNode(from, to, data, value, gasLimit, useCall, timestamp, confirmCb, gasEstimationForceSend, promptCb, callback) {
        const tx = { from: from, to: to, data: data, value: value };
        if (useCall) {
            tx['gas'] = gasLimit;
            if (this._api && this._api.isVM())
                tx['timestamp'] = timestamp;
            return this.getWeb3().eth.call(tx, function (error, result) {
                if (error)
                    return callback(error);
                callback(null, {
                    result: result
                });
            });
        }
        this.getWeb3().eth.estimateGas(tx, (err, gasEstimation) => {
            if (err && err.message.indexOf('Invalid JSON RPC response') !== -1) {
                // // @todo(#378) this should be removed when https://github.com/WalletConnect/walletconnect-monorepo/issues/334 is fixed
                callback(new Error('Gas estimation failed because of an unknown internal error. This may indicated that the transaction will fail.'));
            }
            gasEstimationForceSend(err, () => {
                // callback is called whenever no error
                tx['gas'] = !gasEstimation ? gasLimit : gasEstimation;
                if (this._api.config.getUnpersistedProperty('doNotShowTransactionConfirmationAgain')) {
                    return this._executeTx(tx, null, this._api, promptCb, callback);
                }
                this._api.detectNetwork((err, network) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    confirmCb(network, tx, tx['gas'], (gasPrice) => {
                        return this._executeTx(tx, gasPrice, this._api, promptCb, callback);
                    }, (error) => {
                        callback(error);
                    });
                });
            }, () => {
                const blockGasLimit = this.currentblockGasLimit();
                // NOTE: estimateGas very likely will return a large limit if execution of the code failed
                //       we want to be able to run the code in order to debug and find the cause for the failure
                if (err)
                    return callback(err);
                let warnEstimation = ' An important gas estimation might also be the sign of a problem in the contract code. Please check loops and be sure you did not sent value to a non payable function (that\'s also the reason of strong gas estimation). ';
                warnEstimation += ' ' + err;
                if (gasEstimation > gasLimit) {
                    return callback('Gas required exceeds limit: ' + gasLimit + '. ' + warnEstimation);
                }
                if (gasEstimation > blockGasLimit) {
                    return callback('Gas required exceeds block gas limit: ' + gasLimit + '. ' + warnEstimation);
                }
            });
        });
    }
}
exports.TxRunnerWeb3 = TxRunnerWeb3;
function tryTillReceiptAvailable(txhash, web3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const receipt = yield web3.eth.getTransactionReceipt(txhash);
            if (receipt)
                return receipt;
        }
        catch (e) { }
        yield pause();
        return yield tryTillReceiptAvailable(txhash, web3);
    });
}
function tryTillTxAvailable(txhash, web3) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const tx = yield web3.eth.getTransaction(txhash);
            if (tx)
                return tx;
        }
        catch (e) { }
        return yield tryTillTxAvailable(txhash, web3);
    });
}
function pause() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () { return new Promise((resolve, reject) => { setTimeout(resolve, 500); }); });
}
//# sourceMappingURL=txRunnerWeb3.js.map