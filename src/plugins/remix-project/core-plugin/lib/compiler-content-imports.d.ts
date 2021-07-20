import { Plugin } from '@remixproject/engine';
export declare class CompilerImports extends Plugin {
    previouslyHandled: {};
    urlResolver: any;
    constructor();
    setToken(): Promise<void>;
    isRelativeImport(url: any): RegExpExecArray;
    isExternalUrl(url: any): any;
    /**
      * resolve the content of @arg url. This only resolves external URLs.
      *
      * @param {String} url  - external URL of the content. can be basically anything like raw HTTP, ipfs URL, github address etc...
      * @returns {Promise} - { content, cleanUrl, type, url }
      */
    resolve(url: any): Promise<unknown>;
    import(url: any, force: any, loadingCb: any, cb: any): Promise<any>;
    importExternal(url: any, targetPath: any, cb: any): void;
    /**
      * import the content of @arg url.
      * first look in the browser localstorage (browser explorer) or locahost explorer. if the url start with `browser/*` or  `localhost/*`
      * then check if the @arg url is located in the localhost, in the node_modules or installed_contracts folder
      * then check if the @arg url match any external url
      *
      * @param {String} url - URL of the content. can be basically anything like file located in the browser explorer, in the localhost explorer, raw HTTP, github address etc...
      * @param {String} targetPath - (optional) internal path where the content should be saved to
      * @returns {Promise} - string content
      */
    resolveAndSave(url: any, targetPath: any): Promise<unknown>;
}
