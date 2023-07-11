export declare const baseURLBin = "https://binaries.soliditylang.org/bin";
export declare const baseURLWasm = "https://binaries.soliditylang.org/wasm";
export declare const pathToURL: {};
/**
 * Retrieves the URL of the given compiler version
 * @param version is the version of compiler with or without 'soljson-v' prefix and .js postfix
 */
export declare function urlFromVersion(version: any): string;
/**
 * Checks if the worker can be used to load a compiler.
 * checks a compiler whitelist, browser support and OS.
 */
export declare function canUseWorker(selectedVersion: any): any;
export declare function promisedMiniXhr(url: any): Promise<unknown>;
