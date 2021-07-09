export interface CompilerInput {
    language: Language;
    sources: Source;
    settings: {
        remappings?: string[];
        optimizer: {
            enabled: boolean;
            runs: number;
            details?: {
                peephole?: boolean;
                jumpdestRemover?: boolean;
                orderLiterals?: boolean;
                deduplicate?: boolean;
                cse?: boolean;
                constantOptimizer?: boolean;
                yul?: boolean;
                yulDetails?: {
                    stackAllocation: boolean;
                };
            };
        };
        evmVersion?: EVMVersion;
        debug?: {
            revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug';
        };
        metadata?: {
            useLiteralContent: boolean;
            bytecodeHash: 'ipfs' | 'bzzr1' | 'none';
        };
        libraries?: {
            [fileName: string]: Record<string, string>;
        };
        outputSelection?: {
            '*': {
                '': ['ast'];
                '*': ['abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates', 'evm.assembly'];
            };
        };
    };
}
export interface Source {
    [fileName: string]: {
        keccak256?: string;
        content: string;
        urls?: string[];
    };
}
export interface CompilerInputOptions {
    optimize: boolean | number;
    runs: number;
    libraries?: {
        [fileName: string]: Record<string, string>;
    };
    evmVersion?: EVMVersion;
    language?: Language;
}
export declare type EVMVersion = 'homestead' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople' | 'petersburg' | 'istanbul' | 'muirGlacier' | 'berlin' | 'london' | null;
export declare type Language = 'Solidity' | 'Yul';
export interface CompilerState {
    compileJSON: ((input: SourceWithTarget) => void) | null;
    worker: any;
    currentVersion: string | null | undefined;
    optimize: boolean;
    runs: number;
    evmVersion: EVMVersion | null;
    language: Language;
    compilationStartTime: number | null;
    target: string | null;
    lastCompilationResult: {
        data: CompilationResult | null;
        source: SourceWithTarget | null | undefined;
    } | null;
}
export interface SourceWithTarget {
    sources?: Source;
    target?: string | null | undefined;
}
export interface MessageToWorker {
    cmd: string;
    job?: number;
    input?: CompilerInput;
    data?: string;
}
export interface MessageFromWorker {
    cmd: string;
    job?: number;
    missingInputs?: string[];
    data?: string;
}
export interface visitContractsCallbackParam {
    name: string;
    object: CompiledContract;
    file: string;
}
export interface visitContractsCallbackInterface {
    (param: visitContractsCallbackParam): boolean | void;
}
export interface gatherImportsCallbackInterface {
    (err?: Error | null, result?: SourceWithTarget): any;
}
export interface CompilationResult {
    error?: CompilationError;
    /** not present if no errors/warnings were encountered */
    errors?: CompilationError[];
    /** This contains the file-level outputs. In can be limited/filtered by the outputSelection settings */
    sources?: {
        [contractName: string]: CompilationSource;
    };
    /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings */
    contracts?: {
        /** If the language used has no contract names, this field should equal to an empty string. */
        [fileName: string]: {
            [contract: string]: CompiledContract;
        };
    };
}
export interface CompilationError {
    /** Location within the source file */
    sourceLocation?: {
        file: string;
        start: number;
        end: number;
    };
    /** Error type */
    type?: CompilationErrorType;
    /** Component where the error originated, such as "general", "ewasm", etc. */
    component?: 'general' | 'ewasm' | string;
    severity?: 'error' | 'warning';
    message?: string;
    mode?: 'panic';
    /** the message formatted with source location */
    formattedMessage?: string;
}
declare type CompilationErrorType = 'JSONError' | 'IOError' | 'ParserError' | 'DocstringParsingError' | 'SyntaxError' | 'DeclarationError' | 'TypeError' | 'UnimplementedFeatureError' | 'InternalCompilerError' | 'Exception' | 'CompilerError' | 'FatalError' | 'Warning';
export interface CompilationSource {
    /** Identifier of the source (used in source maps) */
    id: number;
    /** The AST object */
    ast: AstNode;
}
export interface AstNode {
    absolutePath?: string;
    exportedSymbols?: Record<string, unknown>;
    id: number;
    nodeType: string;
    nodes?: Array<AstNode>;
    src: string;
    literals?: Array<string>;
    file?: string;
    scope?: number;
    sourceUnit?: number;
    symbolAliases?: Array<string>;
    [x: string]: any;
}
export interface AstNodeAtt {
    operator?: string;
    string?: null;
    type?: string;
    value?: string;
    constant?: boolean;
    name?: string;
    public?: boolean;
    exportedSymbols?: Record<string, unknown>;
    argumentTypes?: null;
    absolutePath?: string;
    [x: string]: any;
}
export interface CompiledContract {
    /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
    abi: ABIDescription[];
    metadata: string;
    /** User documentation (natural specification) */
    userdoc: UserDocumentation;
    /** Developer documentation (natural specification) */
    devdoc: DeveloperDocumentation;
    /** Intermediate representation (string) */
    ir: string;
    /** EVM-related outputs */
    evm: {
        assembly: string;
        legacyAssembly: Record<string, unknown>;
        /** Bytecode and related details. */
        bytecode: BytecodeObject;
        deployedBytecode: BytecodeObject;
        /** The list of function hashes */
        methodIdentifiers: {
            [functionIdentifier: string]: string;
        };
        gasEstimates: {
            creation: {
                codeDepositCost: string;
                executionCost: 'infinite' | string;
                totalCost: 'infinite' | string;
            };
            external: {
                [functionIdentifier: string]: string;
            };
            internal: {
                [functionIdentifier: string]: 'infinite' | string;
            };
        };
    };
    /** eWASM related outputs */
    ewasm: {
        /** S-expressions format */
        wast: string;
        /** Binary format (hex string) */
        wasm: string;
    };
}
export declare type ABIDescription = FunctionDescription | EventDescription;
export declare const isFunctionDescription: (item: ABIDescription) => item is FunctionDescription;
export declare const isEventDescription: (item: ABIDescription) => item is EventDescription;
export interface FunctionDescription {
    /** Type of the method. default is 'function' */
    type?: 'function' | 'constructor' | 'fallback' | 'receive';
    /** The name of the function. Constructor and fallback function never have name */
    name?: string;
    /** List of parameters of the method. Fallback function doesn’t have inputs. */
    inputs?: ABIParameter[];
    /** List of the outputs parameters for the method, if any */
    outputs?: ABIParameter[];
    /** State mutability of the method */
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
    /** true if function accepts Ether, false otherwise. Default is false */
    payable?: boolean;
    /** true if function is either pure or view, false otherwise. Default is false  */
    constant?: boolean;
}
export interface EventDescription {
    type: 'event';
    name: string;
    inputs: ABIParameter & {
        /** true if the field is part of the log’s topics, false if it one of the log’s data segment. */
        indexed: boolean;
    }[];
    /** true if the event was declared as anonymous. */
    anonymous: boolean;
}
export interface ABIParameter {
    /** The name of the parameter */
    name: string;
    /** The canonical type of the parameter */
    type: ABITypeParameter;
    /** Used for tuple types */
    components?: ABIParameter[];
}
export declare type ABITypeParameter = 'uint' | 'uint[]' | 'int' | 'int[]' | 'address' | 'address[]' | 'bool' | 'bool[]' | 'fixed' | 'fixed[]' | 'ufixed' | 'ufixed[]' | 'bytes' | 'bytes[]' | 'function' | 'function[]' | 'tuple' | 'tuple[]' | string;
export interface UserDocumentation {
    methods: UserMethodList;
    notice: string;
}
export declare type UserMethodList = {
    [functionIdentifier: string]: UserMethodDoc;
} & {
    'constructor'?: string;
};
export interface UserMethodDoc {
    notice: string;
}
export interface DeveloperDocumentation {
    author: string;
    title: string;
    details: string;
    methods: DevMethodList;
}
export interface DevMethodList {
    [functionIdentifier: string]: DevMethodDoc;
}
export interface DevMethodDoc {
    author: string;
    details: string;
    return: string;
    params: {
        [param: string]: string;
    };
}
export interface BytecodeObject {
    /** The bytecode as a hex string. */
    object: string;
    /** Opcodes list */
    opcodes: string;
    /** The source mapping as a string. See the source mapping definition. */
    sourceMap: string;
    /** If given, this is an unlinked object. */
    linkReferences?: {
        [contractName: string]: {
            /** Byte offsets into the bytecode. */
            [library: string]: {
                start: number;
                length: number;
            }[];
        };
    };
}
export {};
