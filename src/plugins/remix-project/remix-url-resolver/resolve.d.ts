export interface Imported {
    content: string;
    cleanUrl: string;
    type: string;
}
interface Handler {
    type: string;
    match(url: string): any;
    handle(match: any): any;
}
interface HandlerResponse {
    content: any;
    cleanUrl: string;
}
export declare class RemixURLResolver {
    private previouslyHandled;
    gistAccessToken: string;
    protocol: string;
    constructor(gistToken?: string, protocol?: string);
    setGistToken(gistToken?: string, protocol?: string): Promise<void>;
    /**
    * Handle an import statement based on github
    * @param root The root of the github import statement
    * @param filePath path of the file in github
    */
    handleGithubCall(root: string, filePath: string): Promise<HandlerResponse>;
    /**
    * Handle an import statement based on http
    * @param url The url of the import statement
    * @param cleanUrl
    */
    handleHttp(url: string, cleanUrl: string): Promise<HandlerResponse>;
    /**
    * Handle an import statement based on https
    * @param url The url of the import statement
    * @param cleanUrl
    */
    handleHttps(url: string, cleanUrl: string): Promise<HandlerResponse>;
    handleSwarm(url: string, cleanUrl: string): Promise<HandlerResponse>;
    /**
    * Handle an import statement based on IPFS
    * @param url The url of the IPFS import statement
    */
    handleIPFS(url: string): Promise<HandlerResponse>;
    /**
    * Handle an import statement based on NPM
    * @param url The url of the NPM import statement
    */
    handleNpmImport(url: string): Promise<HandlerResponse>;
    getHandlers(): Handler[];
    resolve(filePath: string, customHandlers?: Handler[]): Promise<Imported>;
}
export {};
