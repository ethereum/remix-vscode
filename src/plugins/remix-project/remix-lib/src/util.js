'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ethereumjs_util_1 = require("ethereumjs-util");
const string_similarity_1 = tslib_1.__importDefault(require("string-similarity"));
/*
 contains misc util: @TODO should be splitted
  - hex conversion
  - binary search
  - CALL related look up
  - sha3 calculation
  - swarm hash extraction
  - bytecode comparison
*/
/*
    ints: IntArray
  */
/**
   * Converts a hex string to an array of integers.
   */
function hexToIntArray(hexString) {
    if (hexString.slice(0, 2) === '0x') {
        hexString = hexString.slice(2);
    }
    const integers = [];
    for (let i = 0; i < hexString.length; i += 2) {
        integers.push(parseInt(hexString.slice(i, i + 2), 16));
    }
    return integers;
}
exports.hexToIntArray = hexToIntArray;
/*
    ints: list of BNs
  */
function hexListFromBNs(bnList) {
    const ret = [];
    for (const k in bnList) {
        const v = bnList[k];
        if (ethereumjs_util_1.BN.isBN(v)) {
            ret.push('0x' + v.toString('hex', 64));
        }
        else {
            ret.push('0x' + (new ethereumjs_util_1.BN(v)).toString('hex', 64)); // TEMP FIX TO REMOVE ONCE https://github.com/ethereumjs/ethereumjs-vm/pull/293 is released
        }
    }
    return ret;
}
exports.hexListFromBNs = hexListFromBNs;
/*
  ints: ints: IntArray
*/
function formatMemory(mem) {
    const hexMem = ethereumjs_util_1.bufferToHex(mem).substr(2);
    const ret = [];
    for (let k = 0; k < hexMem.length; k += 32) {
        const row = hexMem.substr(k, 32);
        ret.push(row);
    }
    return ret;
}
exports.formatMemory = formatMemory;
/*
  Binary Search:
  Assumes that @arg array is sorted increasingly
  return largest i such that array[i] <= target; return -1 if array[0] > target || array is empty
*/
function findLowerBound(target, array) {
    let start = 0;
    let length = array.length;
    while (length > 0) {
        const half = length >> 1;
        const middle = start + half;
        if (array[middle] <= target) {
            length = length - 1 - half;
            start = middle + 1;
        }
        else {
            length = half;
        }
    }
    return start - 1;
}
exports.findLowerBound = findLowerBound;
/*
  Binary Search:
  Assumes that @arg array is sorted increasingly
  return largest array[i] such that array[i] <= target; return null if array[0] > target || array is empty
*/
function findLowerBoundValue(target, array) {
    const index = this.findLowerBound(target, array);
    return index >= 0 ? array[index] : null;
}
exports.findLowerBoundValue = findLowerBoundValue;
/*
  Binary Search:
  Assumes that @arg array is sorted increasingly
  return Return i such that |array[i] - target| is smallest among all i and -1 for an empty array.
  Returns the smallest i for multiple candidates.
*/
function findClosestIndex(target, array) {
    if (array.length === 0) {
        return -1;
    }
    const index = this.findLowerBound(target, array);
    if (index < 0) {
        return 0;
    }
    else if (index >= array.length - 1) {
        return array.length - 1;
    }
    else {
        const middle = (array[index] + array[index + 1]) / 2;
        return target <= middle ? index : index + 1;
    }
}
exports.findClosestIndex = findClosestIndex;
/**
  * Find the call from @args rootCall which contains @args index (recursive)
  *
  * @param {Int} index - index of the vmtrace
  * @param {Object} rootCall  - call tree, built by the trace analyser
  * @return {Object} - return the call which include the @args index
  */
function findCall(index, rootCall) {
    const ret = buildCallPath(index, rootCall);
    return ret[ret.length - 1];
}
exports.findCall = findCall;
/**
  * Find calls path from @args rootCall which leads to @args index (recursive)
  *
  * @param {Int} index - index of the vmtrace
  * @param {Object} rootCall  - call tree, built by the trace analyser
  * @return {Array} - return the calls path to @args index
  */
function buildCallPath(index, rootCall) {
    const ret = [];
    findCallInternal(index, rootCall, ret);
    return ret;
}
exports.buildCallPath = buildCallPath;
/**
  * sha3 the given @arg value (left pad to 32 bytes)
  *
  * @param {String} value - value to sha3
  * @return {Object} - return sha3ied value
  */
// eslint-disable-next-line camelcase
function sha3_256(value) {
    value = ethereumjs_util_1.toBuffer(ethereumjs_util_1.addHexPrefix(value));
    const retInBuffer = ethereumjs_util_1.keccak(ethereumjs_util_1.setLengthLeft(value, 32));
    return ethereumjs_util_1.bufferToHex(retInBuffer);
}
exports.sha3_256 = sha3_256;
/**
  * return a regex which extract the swarmhash from the bytecode.
  *
  * @return {RegEx}
  */
function swarmHashExtraction() {
    return /a165627a7a72305820([0-9a-f]{64})0029$/;
}
exports.swarmHashExtraction = swarmHashExtraction;
/**
  * return a regex which extract the swarmhash from the bytecode, from POC 0.3
  *
  * @return {RegEx}
  */
function swarmHashExtractionPOC31() {
    return /a265627a7a72315820([0-9a-f]{64})64736f6c6343([0-9a-f]{6})0032$/;
}
exports.swarmHashExtractionPOC31 = swarmHashExtractionPOC31;
/**
  * return a regex which extract the swarmhash from the bytecode, from POC 0.3
  *
  * @return {RegEx}
  */
function swarmHashExtractionPOC32() {
    return /a265627a7a72305820([0-9a-f]{64})64736f6c6343([0-9a-f]{6})0032$/;
}
exports.swarmHashExtractionPOC32 = swarmHashExtractionPOC32;
/**
  * return a regex which extract the cbor encoded metadata : {"ipfs": <IPFS hash>, "solc": <compiler version>} from the bytecode.
  * ref https://solidity.readthedocs.io/en/v0.6.6/metadata.html?highlight=ipfs#encoding-of-the-metadata-hash-in-the-bytecode
  * @return {RegEx}
  */
function cborEncodedValueExtraction() {
    return /64697066735822([0-9a-f]{68})64736f6c6343([0-9a-f]{6})0033$/;
}
exports.cborEncodedValueExtraction = cborEncodedValueExtraction;
function extractcborMetadata(value) {
    return value.replace(this.cborEncodedValueExtraction(), '');
}
exports.extractcborMetadata = extractcborMetadata;
function extractSwarmHash(value) {
    value = value.replace(this.swarmHashExtraction(), '');
    value = value.replace(this.swarmHashExtractionPOC31(), '');
    value = value.replace(this.swarmHashExtractionPOC32(), '');
    return value;
}
exports.extractSwarmHash = extractSwarmHash;
/**
  * Compare bytecode. return true if the code is equal (handle swarm hash and library references)
  * @param {String} code1 - the bytecode that is actually deployed (contains resolved library reference and a potentially different swarmhash)
  * @param {String} code2 - the bytecode generated by the compiler (contains unresolved library reference and a potentially different swarmhash)
                            this will return false if the generated bytecode is empty (asbtract contract cannot be deployed)
  *
  * @return {bool}
  */
function compareByteCode(code1, code2) {
    if (code1 === code2)
        return true;
    if (code2 === '0x')
        return false; // abstract contract. see comment
    if (code2.substr(2, 46) === '7300000000000000000000000000000000000000003014') {
        // testing the following signature: PUSH20 00..00 ADDRESS EQ
        // in the context of a library, that slot contains the address of the library (pushed by the compiler to avoid calling library other than with a DELEGATECALL)
        // if code2 is not a library, well we still suppose that the comparison remain relevant even if we remove some information from `code1`
        code1 = replaceLibReference(code1, 4);
    }
    let pos = -1;
    while ((pos = code2.search(/__(.*)__/)) !== -1) {
        code2 = replaceLibReference(code2, pos);
        code1 = replaceLibReference(code1, pos);
    }
    code1 = this.extractSwarmHash(code1);
    code1 = this.extractcborMetadata(code1);
    code2 = this.extractSwarmHash(code2);
    code2 = this.extractcborMetadata(code2);
    if (code1 && code2) {
        const compare = string_similarity_1.default.compareTwoStrings(code1, code2);
        return compare > 0.93;
    }
    return false;
}
exports.compareByteCode = compareByteCode;
/* util extracted out from remix-ide. @TODO split this file, cause it mix real util fn with solidity related stuff ... */
function groupBy(arr, key) {
    return arr.reduce((sum, item) => {
        const groupByVal = item[key];
        const groupedItems = sum[groupByVal] || [];
        groupedItems.push(item);
        sum[groupByVal] = groupedItems;
        return sum;
    }, {});
}
exports.groupBy = groupBy;
function concatWithSeperator(list, seperator) {
    return list.reduce((sum, item) => sum + item + seperator, '').slice(0, -seperator.length);
}
exports.concatWithSeperator = concatWithSeperator;
function escapeRegExp(str) {
    return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
function replaceLibReference(code, pos) {
    return code.substring(0, pos) + '0000000000000000000000000000000000000000' + code.substring(pos + 40);
}
function findCallInternal(index, rootCall, callsPath) {
    const calls = Object.keys(rootCall.calls);
    const ret = rootCall;
    callsPath.push(rootCall);
    for (const k in calls) {
        const subCall = rootCall.calls[calls[k]];
        if (index >= subCall.start && index <= subCall.return) {
            findCallInternal(index, subCall, callsPath);
            break;
        }
    }
    return ret;
}
//# sourceMappingURL=util.js.map