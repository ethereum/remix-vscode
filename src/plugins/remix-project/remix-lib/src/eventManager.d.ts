export declare class EventManager {
    registered: any;
    anonymous: any;
    constructor();
    unregister(eventName: any, obj: any, func: any): void;
    register(eventName: any, obj: any, func: any): void;
    trigger(eventName: any, args: any): void;
}
