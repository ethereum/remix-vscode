'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const txHelper_1 = require("./txHelper");
/**
  * deploy the given contract
  *
  * @param {String} from    - sender address
  * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
  * @param {String} value    - decimal representation of value.
  * @param {String} gasLimit    - decimal representation of gas limit.
  * @param {Object} txRunner    - TxRunner.js instance
  * @param {Object} callbacks    - { confirmationCb, gasEstimationForceSend, promptCb }
  *     [validate transaction] confirmationCb (network, tx, gasEstimation, continueTxExecution, cancelCb)
  *     [transaction failed, force send] gasEstimationForceSend (error, continueTxExecution, cancelCb)
  *     [personal mode enabled, need password to continue] promptCb (okCb, cancelCb)
  * @param {Function} finalCallback    - last callback.
  */
function createContract(from, data, value, gasLimit, txRunner, callbacks, finalCallback) {
    if (!callbacks.confirmationCb || !callbacks.gasEstimationForceSend || !callbacks.promptCb) {
        return finalCallback('all the callbacks must have been defined');
    }
    const tx = { from: from, to: null, data: data, useCall: false, value: value, gasLimit: gasLimit };
    txRunner.rawRun(tx, callbacks.confirmationCb, callbacks.gasEstimationForceSend, callbacks.promptCb, (error, txResult) => {
        // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
        finalCallback(error, txResult);
    });
}
exports.createContract = createContract;
/**
  * call the current given contract ! that will create a transaction !
  *
  * @param {String} from    - sender address
  * @param {String} to    - recipient address
  * @param {String} data    - data to send with the transaction ( return of txFormat.buildData(...) ).
  * @param {String} value    - decimal representation of value.
  * @param {String} gasLimit    - decimal representation of gas limit.
  * @param {Object} txRunner    - TxRunner.js instance
  * @param {Object} callbacks    - { confirmationCb, gasEstimationForceSend, promptCb }
  *     [validate transaction] confirmationCb (network, tx, gasEstimation, continueTxExecution, cancelCb)
  *     [transaction failed, force send] gasEstimationForceSend (error, continueTxExecution, cancelCb)
  *     [personal mode enabled, need password to continue] promptCb (okCb, cancelCb)
  * @param {Function} finalCallback    - last callback.
  */
function callFunction(from, to, data, value, gasLimit, funAbi, txRunner, callbacks, finalCallback) {
    const useCall = funAbi.stateMutability === 'view' || funAbi.stateMutability === 'pure' || funAbi.constant;
    const tx = { from, to, data, useCall, value, gasLimit };
    txRunner.rawRun(tx, callbacks.confirmationCb, callbacks.gasEstimationForceSend, callbacks.promptCb, (error, txResult) => {
        // see universaldapp.js line 660 => 700 to check possible values of txResult (error case)
        finalCallback(error, txResult);
    });
}
exports.callFunction = callFunction;
/**
  * check if the vm has errored
  *
  * @param {Object} execResult    - execution result given by the VM
  * @return {Object} -  { error: true/false, message: DOMNode }
  */
function checkVMError(execResult, abi, contract) {
    const errorCode = {
        OUT_OF_GAS: 'out of gas',
        STACK_UNDERFLOW: 'stack underflow',
        STACK_OVERFLOW: 'stack overflow',
        INVALID_JUMP: 'invalid JUMP',
        INVALID_OPCODE: 'invalid opcode',
        REVERT: 'revert',
        STATIC_STATE_CHANGE: 'static state change',
        INTERNAL_ERROR: 'internal error',
        CREATE_COLLISION: 'create collision',
        STOP: 'stop',
        REFUND_EXHAUSTED: 'refund exhausted'
    };
    const ret = {
        error: false,
        message: ''
    };
    if (!execResult.exceptionError) {
        return ret;
    }
    const exceptionError = execResult.exceptionError.error || '';
    const error = `VM error: ${exceptionError}.\n`;
    let msg;
    if (exceptionError === errorCode.INVALID_OPCODE) {
        msg = '\t\n\tThe execution might have thrown.\n';
        ret.error = true;
    }
    else if (exceptionError === errorCode.OUT_OF_GAS) {
        msg = '\tThe transaction ran out of gas. Please increase the Gas Limit.\n';
        ret.error = true;
    }
    else if (exceptionError === errorCode.REVERT) {
        const returnData = execResult.returnValue;
        const returnDataHex = returnData.slice(0, 4).toString('hex');
        let customError;
        if (abi) {
            let decodedCustomErrorInputsClean;
            for (const item of abi) {
                if (item.type === 'error') {
                    // ethers doesn't crash anymore if "error" type is specified, but it doesn't extract the errors. see:
                    // https://github.com/ethers-io/ethers.js/commit/bd05aed070ac9e1421a3e2bff2ceea150bedf9b7
                    // we need here to fake the type, so the "getSighash" function works properly
                    const fn = txHelper_1.getFunctionFragment(Object.assign(Object.assign({}, item), { type: 'function', stateMutability: 'nonpayable' }));
                    if (!fn)
                        continue;
                    const sign = fn.getSighash(item.name);
                    if (!sign)
                        continue;
                    if (returnDataHex === sign.replace('0x', '')) {
                        customError = item.name;
                        const functionDesc = fn.getFunction(item.name);
                        // decoding error parameters
                        const decodedCustomErrorInputs = fn.decodeFunctionData(functionDesc, returnData);
                        decodedCustomErrorInputsClean = {};
                        let devdoc = {};
                        // "contract" reprensents the compilation result containing the NATSPEC documentation
                        if (contract && fn.functions && Object.keys(fn.functions).length) {
                            const functionSignature = Object.keys(fn.functions)[0];
                            //  we check in the 'devdoc' if there's a developer documentation for this error
                            devdoc = contract.object.devdoc.errors[functionSignature][0] || {};
                            //  we check in the 'userdoc' if there's an user documentation for this error
                            const userdoc = contract.object.userdoc.errors[functionSignature][0] || {};
                            if (userdoc)
                                customError += ' : ' + userdoc.notice; // we append the user doc if any
                        }
                        for (const input of functionDesc.inputs) {
                            const v = decodedCustomErrorInputs[input.name];
                            decodedCustomErrorInputsClean[input.name] = {
                                value: v.toString ? v.toString() : v,
                                documentation: devdoc.params[input.name] // we add the developer documentation for this input parameter if any
                            };
                        }
                        break;
                    }
                }
            }
            if (decodedCustomErrorInputsClean) {
                msg = '\tThe transaction has been reverted to the initial state.\nError provided by the contract:';
                msg += `\n${customError}`;
                msg += '\nParameters:';
                msg += `\n${JSON.stringify(decodedCustomErrorInputsClean, null, ' ')}`;
            }
        }
        if (!customError) {
            // It is the hash of Error(string)
            if (returnData && (returnDataHex === '08c379a0')) {
                const abiCoder = new ethers_1.ethers.utils.AbiCoder();
                const reason = abiCoder.decode(['string'], returnData.slice(4))[0];
                msg = `\tThe transaction has been reverted to the initial state.\nReason provided by the contract: "${reason}".`;
            }
            else {
                msg = '\tThe transaction has been reverted to the initial state.\nNote: The called function should be payable if you send value and the value you send should be less than your current balance.';
            }
        }
        ret.error = true;
    }
    else if (exceptionError === errorCode.STATIC_STATE_CHANGE) {
        msg = '\tState changes is not allowed in Static Call context\n';
        ret.error = true;
    }
    ret.message = `${error}\n${exceptionError}\n${msg}\nDebug the transaction to get more information.`;
    return ret;
}
exports.checkVMError = checkVMError;
//# sourceMappingURL=txExecution.js.map