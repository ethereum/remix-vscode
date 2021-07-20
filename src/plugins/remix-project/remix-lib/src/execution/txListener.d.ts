/**
  * poll web3 each 2s if web3
  * listen on transaction executed event if VM
  * attention: blocks returned by the event `newBlock` have slightly different json properties whether web3 or the VM is used
  * trigger 'newBlock'
  *
  */
export declare class TxListener {
    event: any;
    executionContext: any;
    _resolvedTransactions: any;
    _api: any;
    _resolvedContracts: any;
    _isListening: boolean;
    _listenOnNetwork: boolean;
    _loopId: any;
    blocks: any;
    lastBlock: any;
    constructor(opt: any, executionContext: any);
    /**
      * define if txlistener should listen on the network or if only tx created from remix are managed
      *
      * @param {Bool} type - true if listen on the network
      */
    setListenOnNetwork(listenOnNetwork: any): void;
    /**
      * reset recorded transactions
      */
    init(): void;
    /**
      * start listening for incoming transactions
      *
      * @param {String} type - type/name of the provider to add
      * @param {Object} obj  - provider
      */
    startListening(): void;
    /**
      * stop listening for incoming transactions. do not reset the recorded pool.
      *
      * @param {String} type - type/name of the provider to add
      * @param {Object} obj  - provider
      */
    stopListening(): void;
    _startListenOnNetwork(): void;
    _manageBlock(blockNumber: any): void;
    /**
      * try to resolve the contract name from the given @arg address
      *
      * @param {String} address - contract address to resolve
      * @return {String} - contract name
      */
    resolvedContract(address: any): any;
    /**
      * try to resolve the transaction from the given @arg txHash
      *
      * @param {String} txHash - contract address to resolve
      * @return {String} - contract name
      */
    resolvedTransaction(txHash: any): any;
    _newBlock(block: any): void;
    _resolve(transactions: any, callback: any): void;
    _resolveTx(tx: any, receipt: any, cb: any): any;
    _resolveFunction(contract: any, tx: any, isCtor: any): any;
    _tryResolveContract(codeToResolve: any, compiledContracts: any, isCreation: any): any;
    _decodeInputParams(data: any, abi: any): {};
}
