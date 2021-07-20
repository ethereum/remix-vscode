export declare class LogsManager {
    notificationCallbacks: any;
    subscriptions: any;
    filters: any;
    filterTracking: any;
    oldLogs: any;
    constructor();
    checkBlock(blockNumber: any, block: any, web3: any): void;
    eventMatchesFilter(changeEvent: any, queryType: any, queryFilter: any): boolean;
    getSubscriptionsFor(changeEvent: any): any[];
    getLogsForSubscription(subscriptionId: any): any[];
    transmit(result: any): void;
    addListener(_type: any, cb: any): void;
    subscribe(params: any): string;
    unsubscribe(subscriptionId: any): void;
    newFilter(filterType: any, params: any): string;
    uninstallFilter(filterId: any): void;
    getLogsForFilter(filterId: any, logsOnly: any): any;
    getLogsFor(params: any): any[];
}
