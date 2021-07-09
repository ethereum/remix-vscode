'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const ethjs_util_1 = require("ethjs-util");
function convertToPrefixedHex(input) {
    if (input === undefined || input === null || ethjs_util_1.isHexString(input)) {
        return input;
    }
    else if (Buffer.isBuffer(input)) {
        return ethereumjs_util_1.bufferToHex(input);
    }
    return '0x' + input.toString(16);
}
/*
 txResult.result can be 3 different things:
 - VM call or tx: ethereumjs-vm result object
 - Node transaction: object returned from eth.getTransactionReceipt()
 - Node call: return value from function call (not an object)

 Also, VM results use BN and Buffers, Node results use hex strings/ints,
 So we need to normalize the values to prefixed hex strings
*/
function resultToRemixTx(txResult, execResult) {
    const { receipt, transactionHash, result } = txResult;
    const { status, gasUsed, contractAddress } = receipt;
    let returnValue, errorMessage;
    if (ethjs_util_1.isHexString(result)) {
        returnValue = result;
    }
    else if (execResult !== undefined) {
        returnValue = execResult.returnValue;
        errorMessage = execResult.exceptionError;
    }
    return {
        transactionHash,
        status,
        gasUsed: convertToPrefixedHex(gasUsed),
        error: errorMessage,
        return: convertToPrefixedHex(returnValue),
        createdAddress: convertToPrefixedHex(contractAddress)
    };
}
exports.resultToRemixTx = resultToRemixTx;
//# sourceMappingURL=txResultHelper.js.map