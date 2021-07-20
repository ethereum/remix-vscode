import { Plugin } from '@remixproject/engine';
export declare class FetchAndCompile extends Plugin {
    unresolvedAddresses: any[];
    sourceVerifierNetWork: string[];
    constructor();
    /**
     * Fetch compiliation metadata from source-Verify from a given @arg contractAddress - https://github.com/ethereum/source-verify
     * Put the artifacts in the file explorer
     * Compile the code using Solidity compiler
     * Returns compilation data
     *
     * @param {string} contractAddress - Address of the contrac to resolve
     * @param {string} deployedBytecode - deployedBytecode of the contract
     * @param {string} targetPath - Folder where to save the compilation arfefacts
     * @return {CompilerAbstract} - compilation data targeting the given @arg contractAddress
     */
    resolve(contractAddress: any, codeAtAddress: any, targetPath: any): Promise<any>;
}
