export declare class CompilerAbstract {
    languageversion: any;
    data: any;
    source: any;
    constructor(languageversion: any, data: any, source: any);
    getContracts(): any;
    getContract(name: any): Record<string, any>;
    visitContracts(calllback: any): void;
    getData(): any;
    getAsts(): any;
    getSourceName(fileIndex: any): string;
    getSourceCode(): any;
}
