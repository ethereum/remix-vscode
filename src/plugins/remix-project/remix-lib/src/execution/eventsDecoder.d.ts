/**
  * Register to txListener and extract events
  *
  */
export declare class EventsDecoder {
    resolveReceipt: any;
    constructor({ resolveReceipt }: {
        resolveReceipt: any;
    });
    /**
    * use Transaction Receipt to decode logs. assume that the transaction as already been resolved by txListener.
    * logs are decoded only if the contract if known by remix.
    *
    * @param {Object} tx - transaction object
    * @param {Function} cb - callback
    */
    parseLogs(tx: any, contractName: any, compiledContracts: any, cb: any): any;
    _decodeLogs(tx: any, receipt: any, contract: any, contracts: any, cb: any): any;
    _eventABI(contract: any): Record<string, {
        event: any;
        inputs: any;
        object: any;
        abi: any;
    }>;
    _eventsABI(compiledContracts: any): Record<string, unknown>;
    _event(hash: any, eventsABI: any): any;
    _stringifyBigNumber(value: any): string;
    _stringifyEvent(value: any): any;
    _decodeEvents(tx: any, logs: any, contractName: any, compiledContracts: any, cb: any): void;
}
