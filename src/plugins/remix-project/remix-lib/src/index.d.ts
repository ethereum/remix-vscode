import { EventManager } from './eventManager';
import * as uiHelper from './helpers/uiHelper';
import * as compilerHelper from './helpers/compilerHelper';
import * as util from './util';
import { Web3Providers } from './web3Provider/web3Providers';
import { DummyProvider } from './web3Provider/dummyProvider';
import { Web3VmProvider } from './web3Provider/web3VmProvider';
import { Storage } from './storage';
import { EventsDecoder } from './execution/eventsDecoder';
import * as txExecution from './execution/txExecution';
import * as txHelper from './execution/txHelper';
import * as txFormat from './execution/txFormat';
import { TxListener } from './execution/txListener';
import { TxRunner } from './execution/txRunner';
import { LogsManager } from './execution/logsManager';
import { forkAt } from './execution/forkAt';
import * as typeConversion from './execution/typeConversion';
import { TxRunnerVM } from './execution/txRunnerVM';
import { TxRunnerWeb3 } from './execution/txRunnerWeb3';
import * as txResultHelper from './helpers/txResultHelper';
declare const _default: {
    EventManager: typeof EventManager;
    helpers: {
        ui: typeof uiHelper;
        compiler: typeof compilerHelper;
        txResultHelper: typeof txResultHelper;
    };
    vm: {
        Web3Providers: typeof Web3Providers;
        DummyProvider: typeof DummyProvider;
        Web3VMProvider: typeof Web3VmProvider;
    };
    Storage: typeof Storage;
    util: typeof util;
    execution: {
        EventsDecoder: typeof EventsDecoder;
        txExecution: typeof txExecution;
        txHelper: typeof txHelper;
        txFormat: typeof txFormat;
        txListener: typeof TxListener;
        TxRunner: typeof TxRunner;
        TxRunnerWeb3: typeof TxRunnerWeb3;
        TxRunnerVM: typeof TxRunnerVM;
        typeConversion: typeof typeConversion;
        LogsManager: typeof LogsManager;
        forkAt: typeof forkAt;
    };
};
export = _default;
