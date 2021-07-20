/**
  * build the transaction data
  *
  * @param {Object} function abi
  * @param {Object} values to encode
  * @param {String} contractbyteCode
  */
export declare function encodeData(funABI: any, values: any, contractbyteCode: any): {
    error: string;
    data?: undefined;
} | {
    data: string;
    error?: undefined;
};
/**
* encode function / constructor parameters
*
* @param {Object} params    - input paramater of the function to call
* @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
* @param {Function} callback    - callback
*/
export declare function encodeParams(params: any, funAbi: any, callback: any): any;
/**
* encode function call (function id + encoded parameters)
*
* @param {Object} params    - input paramater of the function to call
* @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
* @param {Function} callback    - callback
*/
export declare function encodeFunctionCall(params: any, funAbi: any, callback: any): void;
/**
* encode constructor creation and link with provided libraries if needed
*
* @param {Object} contract    - input paramater of the function to call
* @param {Object} params    - input paramater of the function to call
* @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
* @param {Object} linkLibraries    - contains {linkReferences} object which list all the addresses to be linked
* @param {Object} linkReferences    - given by the compiler, contains the proper linkReferences
* @param {Function} callback    - callback
*/
export declare function encodeConstructorCallAndLinkLibraries(contract: any, params: any, funAbi: any, linkLibraries: any, linkReferences: any, callback: any): void;
/**
* encode constructor creation and deploy librairies if needed
*
* @param {String} contractName    - current contract name
* @param {Object} contract    - input paramater of the function to call
* @param {Object} contracts    - map of all compiled contracts.
* @param {Object} params    - input paramater of the function to call
* @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
* @param {Function} callback    - callback
* @param {Function} callbackStep  - callbackStep
* @param {Function} callbackDeployLibrary  - callbackDeployLibrary
* @param {Function} callback    - callback
*/
export declare function encodeConstructorCallAndDeployLibraries(contractName: any, contract: any, contracts: any, params: any, funAbi: any, callback: any, callbackStep: any, callbackDeployLibrary: any): void;
/**
* (DEPRECATED) build the transaction data
*
* @param {String} contractName
* @param {Object} contract    - abi definition of the current contract.
* @param {Object} contracts    - map of all compiled contracts.
* @param {Bool} isConstructor    - isConstructor.
* @param {Object} funAbi    - abi definition of the function to call. null if building data for the ctor.
* @param {Object} params    - input paramater of the function to call
* @param {Function} callback    - callback
* @param {Function} callbackStep  - callbackStep
* @param {Function} callbackDeployLibrary  - callbackDeployLibrary
*/
export declare function buildData(contractName: any, contract: any, contracts: any, isConstructor: any, funAbi: any, params: any, callback: any, callbackStep: any, callbackDeployLibrary: any): any;
export declare function atAddress(): void;
export declare function linkBytecodeStandard(contract: any, contracts: any, callback: any, callbackStep: any, callbackDeployLibrary: any): void;
export declare function linkBytecodeLegacy(contract: any, contracts: any, callback: any, callbackStep: any, callbackDeployLibrary: any): any;
export declare function linkBytecode(contract: any, contracts: any, callback?: any, callbackStep?: any, callbackDeployLibrary?: any): any;
export declare function deployLibrary(libraryName: any, libraryShortName: any, library: any, contracts: any, callback: any, callbackStep: any, callbackDeployLibrary: any): any;
export declare function linkLibraryStandardFromlinkReferences(libraryName: any, address: any, bytecode: any, linkReferences: any): any;
export declare function linkLibraryStandard(libraryName: any, address: any, bytecode: any, contract: any): any;
export declare function setLibraryAddress(address: any, bytecodeToLink: any, positions: any): any;
export declare function linkLibrary(libraryName: any, address: any, bytecodeToLink: any): any;
export declare function decodeResponse(response: any, fnabi: any): {};
export declare function parseFunctionParams(params: any): any[];
export declare function isArrayOrStringStart(str: any, index: any): boolean;
