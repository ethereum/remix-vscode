export declare class TxRunner {
    event: any;
    runAsync: any;
    pendingTxs: any;
    queusTxs: any;
    opt: any;
    internalRunner: any;
    constructor(internalRunner: any, opt: any);
    rawRun(args: any, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, cb: any): void;
    execute(args: any, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, callback: any): void;
}
