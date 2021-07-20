import { Plugin } from '@remixproject/engine';
export declare class CompilerArtefacts extends Plugin {
    compilersArtefactsPerFile: any;
    compilersArtefacts: any;
    constructor();
    clear(): void;
    onActivation(): void;
    getAllContractDatas(): {};
    getCompilerAbstract(file: any): any;
    addResolvedContract(address: any, compilerData: any): void;
    isResolved(address: any): boolean;
    get(key: any): any;
}
