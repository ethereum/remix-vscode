export default class EventManager {
    registered: any;
    anonymous: any;
    unregister(eventName: any, obj: any, func: any): void;
    register(eventName: any, obj: any, func: any): void;
    trigger(eventName: any, args: any): void;
}
