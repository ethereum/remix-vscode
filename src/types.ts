export interface PluginInfo {
  name: string;
  displayName: string;
  description: string;
  methods?: (string | null)[] | null;
  events?: null[] | null;
  version?: string | null;
  url: string;
  icon: string;
  location: string;
  kind?: string | null;
  notifications?: Notifications | null;
  documentation?: string | null;
  permission?: boolean;
  targets?: string[];
  targetVersion?: any | null;
}


interface Notifications {
  solidity?: string[] | null;
  udapp?: string[] | null;
  network?: string[] | null;
}
export interface CompilerInput {
    // Required: Source code language. Currently supported are "Solidity" and "Yul".
  language: Language,
  // Required
  sources: Source,
  // Optional
  settings:
  {
    // Optional: Sorted list of remappings
    remappings?: string[],
    // Optional: Optimizer settings
    optimizer: {
      // disabled by default
      enabled: boolean,
      // Optimize for how many times you intend to run the code.
      // Lower values will optimize more for initial deployment cost, higher
      // values will optimize more for high-frequency usage.
      runs: number,
      // Switch optimizer components on or off in detail.
      // The "enabled" switch above provides two defaults which can be
      // tweaked here. If "details" is given, "enabled" can be omitted.
      details?: {
        // The peephole optimizer is always on if no details are given,
        // use details to switch it off.
        peephole?: boolean,
        // The unused jumpdest remover is always on if no details are given,
        // use details to switch it off.
        jumpdestRemover?: boolean,
        // Sometimes re-orders literals in commutative operations.
        orderLiterals?: boolean,
        // Removes duplicate code blocks
        deduplicate?: boolean,
        // Common subexpression elimination, this is the most complicated step but
        // can also provide the largest gain.
        cse?: boolean,
        // Optimize representation of literal numbers and strings in code.
        constantOptimizer?: boolean,
        // The new Yul optimizer. Mostly operates on the code of ABIEncoderV2.
        // It can only be activated through the details here.
        yul?: boolean,
        // Tuning options for the Yul optimizer.
        yulDetails?: {
          // Improve allocation of stack slots for variables, can free up stack slots early.
          // Activated by default if the Yul optimizer is activated.
          stackAllocation: boolean
        }
      }
    },
    // Version of the EVM to compile for.
    // Affects type checking and code generation.
    evmVersion?: EVMVersion,
    // Optional: Debugging settings
    debug?: {
      // How to treat revert (and require) reason strings. Settings are
      // "default", "strip", "debug" and "verboseDebug".
      // "default" does not inject compiler-generated revert strings and keeps user-supplied ones.
      // "strip" removes all revert strings (if possible, i.e. if literals are used) keeping side-effects
      // "debug" injects strings for compiler-generated internal reverts (not yet implemented)
      // "verboseDebug" even appends further information to user-supplied revert strings (not yet implemented)
      revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug'
    }
    // Metadata settings (optional)
    metadata?: {
      // Use only literal content and not URLs (false by default)
      useLiteralContent: boolean,
      // Use the given hash method for the metadata hash that is appended to the bytecode.
      // The metadata hash can be removed from the bytecode via option "none".
      // The other options are "ipfs" and "bzzr1".
      // If the option is omitted, "ipfs" is used by default.
      bytecodeHash: 'ipfs' | 'bzzr1' | 'none'
    },
    // Addresses of the libraries. If not all libraries are given here,
    // it can result in unlinked objects whose output data is different.
    libraries?: {
      // The top level key is the the name of the source file where the library is used.
      // If remappings are used, this source file should match the global path
      // after remappings were applied.
      // If this key is an empty string, that refers to a global level.
      [fileName: string]: Record<string, string>
    }
    // The following can be used to select desired outputs based
    // on file and contract names.
    // If this field is omitted, then the compiler loads and does type checking,
    // but will not generate any outputs apart from errors.
    // The first level key is the file name and the second level key is the contract name.
    // An empty contract name is used for outputs that are not tied to a contract
    // but to the whole source file like the AST.
    // A star as contract name refers to all contracts in the file.
    // Similarly, a star as a file name matches all files.
    // To select all outputs the compiler can possibly generate, use
    // "outputSelection: { "*": { "*": [ "*" ], "": [ "*" ] } }"
    // but note that this might slow down the compilation process needlessly.
    //
    // The available output types are as follows:
    //
    // File level (needs empty string as contract name):
    //   ast - AST of all source files
    //   legacyAST - legacy AST of all source files
    //
    // Contract level (needs the contract name or "*"):
    //   abi - ABI
    //   devdoc - Developer documentation (natspec)
    //   userdoc - User documentation (natspec)
    //   metadata - Metadata
    //   ir - Yul intermediate representation of the code before optimization
    //   irOptimized - Intermediate representation after optimization
    //   storageLayout - Slots, offsets and types of the contract's state variables.
    //   evm.assembly - New assembly format
    //   evm.legacyAssembly - Old-style assembly format in JSON
    //   evm.bytecode.object - Bytecode object
    //   evm.bytecode.opcodes - Opcodes list
    //   evm.bytecode.sourceMap - Source mapping (useful for debugging)
    //   evm.bytecode.linkReferences - Link references (if unlinked object)
    //   evm.deployedBytecode* - Deployed bytecode (has the same options as evm.bytecode)
    //   evm.methodIdentifiers - The list of function hashes
    //   evm.gasEstimates - Function gas estimates
    //   ewasm.wast - eWASM S-expressions format (not supported at the moment)
    //   ewasm.wasm - eWASM binary format (not supported at the moment)
    //
    // Note that using a using `evm`, `evm.bytecode`, `ewasm`, etc. will select every
    // target part of that output. Additionally, `*` can be used as a wildcard to request everything.
    //
    outputSelection?: {
        '*': {
          '': [ 'ast' ],
          '*': [ '*' ] | [ 'abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates', 'evm.assembly' ]
        }
    }
  }
}
export interface CompilerInputOptions {
    optimize: boolean | number,
    runs: number,
    libraries?:  {
        [fileName: string]: Record<string, string>
    },
    evmVersion?: EVMVersion,
    language?: Language
}

type EVMVersion = 'homestead' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople' | 'petersburg' | 'istanbul' | 'muirGlacier' | null
type Language = 'Solidity' | 'Yul'

export interface Source {
    [fileName: string]:
        {
        // Optional: keccak256 hash of the source file
        keccak256?: string,
        // Required (unless "urls" is used): literal contents of the source file
        content: string,
        urls?: string[]
        }
}

export interface RemixPosition {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

export interface Annotation extends Error {
  row: number;
  column: number;
  text: string;
  type: "error" | "warning" | "information";
}

export interface ISource {
  content: string | undefined
}
export interface ISources {
  [key: string]: ISource
}