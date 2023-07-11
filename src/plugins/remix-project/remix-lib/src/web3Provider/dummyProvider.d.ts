export declare class DummyProvider {
    eth: any;
    debug: any;
    providers: any;
    currentProvider: any;
    constructor();
    getCode(address: any, cb: any): void;
    setProvider(provider: any): void;
    traceTransaction(txHash: any, options: any, cb: any): {};
    storageRangeAt(blockNumber: any, txIndex: any, address: any, start: any, end: any, maxLength: any, cb: any): {};
    getBlockNumber(cb: any): void;
    getTransaction(txHash: any, cb: any): {};
    getTransactionFromBlock(blockNumber: any, txIndex: any, cb: any): {};
}
