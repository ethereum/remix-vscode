'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * @dev Get contract obj of given contract name from last compilation result.
     * @param name contract name
     * @param contracts 'contracts' object from last compilation result
     */
    getContract: (contractName, contracts) => {
        for (const file in contracts) {
            if (contracts[file][contractName]) {
                return { object: contracts[file][contractName], file: file };
            }
        }
        return null;
    },
    /**
     * @dev call the given callback for all contracts from last compilation result, stop visiting when cb return true
     * @param contracts - 'contracts' object from last compilation result
     * @param cb    - callback
     */
    visitContracts: (contracts, cb) => {
        for (const file in contracts) {
            for (const name in contracts[file]) {
                const param = {
                    name: name,
                    object: contracts[file][name],
                    file: file
                };
                if (cb(param))
                    return;
            }
        }
    }
};
//# sourceMappingURL=txHelper.js.map