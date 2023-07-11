import { ethers } from 'ethers';
export declare function makeFullTypeDefinition(typeDef: any): any;
export declare function encodeParams(funABI: any, args: any): string;
export declare function encodeFunctionId(funABI: any): string;
export declare function getFunctionFragment(funABI: any): ethers.utils.Interface;
export declare function sortAbiFunction(contractabi: any): any;
export declare function getConstructorInterface(abi: any): {
    name: string;
    inputs: any[];
    type: string;
    payable: boolean;
    outputs: any[];
};
export declare function serializeInputs(fnAbi: any): string;
export declare function extractSize(type: any): any;
export declare function getFunction(abi: any, fnName: any): any;
export declare function getFallbackInterface(abi: any): any;
export declare function getReceiveInterface(abi: any): any;
/**
  * return the contract obj of the given @arg name. Uses last compilation result.
  * return null if not found
  * @param {String} name    - contract name
  * @returns contract obj and associated file: { contract, file } or null
  */
export declare function getContract(contractName: any, contracts: any): {
    object: any;
    file: string;
};
/**
  * call the given @arg cb (function) for all the contracts. Uses last compilation result
  * stop visiting when cb return true
  * @param {Function} cb    - callback
  */
export declare function visitContracts(contracts: any, cb: any): void;
export declare function inputParametersDeclarationToString(abiinputs: any): any;
