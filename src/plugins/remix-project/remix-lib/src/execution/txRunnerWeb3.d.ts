import Web3 from 'web3';
export declare class TxRunnerWeb3 {
    event: any;
    _api: any;
    getWeb3: () => Web3;
    currentblockGasLimit: () => number;
    constructor(api: any, getWeb3: any, currentblockGasLimit: any);
    _executeTx(tx: any, gasPrice: any, api: any, promptCb: any, callback: any): void;
    _sendTransaction(sendTx: any, tx: any, pass: any, callback: any): any;
    execute(args: any, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, callback: any): Promise<string>;
    runInNode(from: any, to: any, data: any, value: any, gasLimit: any, useCall: any, timestamp: any, confirmCb: any, gasEstimationForceSend: any, promptCb: any, callback: any): Promise<string>;
}
