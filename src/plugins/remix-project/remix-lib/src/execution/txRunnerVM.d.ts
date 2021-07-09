export declare class TxRunnerVM {
    event: any;
    blockNumber: any;
    runAsync: any;
    pendingTxs: any;
    vmaccounts: any;
    queusTxs: any;
    blocks: any;
    txs: any;
    logsManager: any;
    commonContext: any;
    getVMObject: () => any;
    constructor(vmaccounts: any, api: any, getVMObject: any);
    execute(args: any, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, callback: any): void;
    runInVm(from: any, to: any, data: any, value: any, gasLimit: any, useCall: any, timestamp: any, callback: any): any;
    runBlockInVm(tx: any, block: any, callback: any): void;
}
