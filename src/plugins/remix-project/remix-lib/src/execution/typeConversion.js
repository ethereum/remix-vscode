'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
function toInt(h) {
    if (h.indexOf && h.indexOf('0x') === 0) {
        return (new ethereumjs_util_1.BN(h.replace('0x', ''), 16)).toString(10);
    }
    else if ((h.constructor && h.constructor.name === 'BigNumber') || ethereumjs_util_1.BN.isBN(h)) {
        return h.toString(10);
    }
    return h;
}
exports.toInt = toInt;
exports.stringify = convertToString;
function convertToString(v) {
    try {
        if (v instanceof Array) {
            const ret = [];
            for (var k in v) {
                ret.push(convertToString(v[k]));
            }
            return ret;
        }
        else if (ethereumjs_util_1.BN.isBN(v) || (v.constructor && v.constructor.name === 'BigNumber')) {
            return v.toString(10);
        }
        else if (v._isBuffer) {
            return ethereumjs_util_1.bufferToHex(v);
        }
        else if (typeof v === 'object') {
            const retObject = {};
            for (const i in v) {
                retObject[i] = convertToString(v[i]);
            }
            return retObject;
        }
        else {
            return v;
        }
    }
    catch (e) {
        console.log(e);
        return v;
    }
}
//# sourceMappingURL=typeConversion.js.map