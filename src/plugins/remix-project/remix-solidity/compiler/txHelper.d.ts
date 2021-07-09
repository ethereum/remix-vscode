import { visitContractsCallbackInterface } from './types';
declare const _default: {
    /**
     * @dev Get contract obj of given contract name from last compilation result.
     * @param name contract name
     * @param contracts 'contracts' object from last compilation result
     */
    getContract: (contractName: string, contracts: {
        [fileName: string]: {
            [contract: string]: import("./types").CompiledContract;
        };
    }) => Record<string, any>;
    /**
     * @dev call the given callback for all contracts from last compilation result, stop visiting when cb return true
     * @param contracts - 'contracts' object from last compilation result
     * @param cb    - callback
     */
    visitContracts: (contracts: {
        [fileName: string]: {
            [contract: string]: import("./types").CompiledContract;
        };
    }, cb: visitContractsCallbackInterface) => void;
};
export default _default;
