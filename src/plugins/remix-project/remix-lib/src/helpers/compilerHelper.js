"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compilerInput(contracts) {
    return JSON.stringify({
        language: 'Solidity',
        sources: {
            'test.sol': {
                content: contracts
            }
        },
        settings: {
            optimizer: {
                enabled: false,
                runs: 200
            },
            outputSelection: {
                '*': {
                    '': ['ast'],
                    '*': ['abi', 'metadata', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates']
                }
            }
        }
    });
}
exports.compilerInput = compilerInput;
//# sourceMappingURL=compilerHelper.js.map