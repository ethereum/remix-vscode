export declare class Storage {
    prefix: any;
    constructor(prefix: any);
    exists(name: any): boolean;
    get(name: any): string;
    set(name: any, content: any): boolean;
    remove(name: any): boolean;
    rename(originalName: any, newName: any): boolean;
    safeKeys(): string[];
    keys(): string[];
}
