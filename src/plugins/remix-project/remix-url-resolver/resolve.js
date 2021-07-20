"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// eslint-disable-next-line no-unused-vars
const axios_1 = tslib_1.__importDefault(require("axios"));
const bzz_node_1 = require("@erebos/bzz-node");
class RemixURLResolver {
    constructor(gistToken, protocol = 'http:') {
        this.previouslyHandled = {};
        this.setGistToken(gistToken, protocol);
    }
    setGistToken(gistToken, protocol = 'http:') {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.gistAccessToken = gistToken || '';
            this.protocol = protocol;
        });
    }
    /**
    * Handle an import statement based on github
    * @param root The root of the github import statement
    * @param filePath path of the file in github
    */
    handleGithubCall(root, filePath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const regex = filePath.match(/blob\/([^/]+)\/(.*)/);
            let reference = 'master';
            if (regex) {
                // if we have /blob/master/+path we extract the branch name "master" and add it as a parameter to the github api
                // the ref can be branch name, tag, commit id
                reference = regex[1];
                filePath = filePath.replace(`blob/${reference}/`, '');
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const req = `https://raw.githubusercontent.com/${root}/${reference}/${filePath}`;
                const response = yield axios_1.default.get(req);
                return { content: response.data, cleanUrl: root + '/' + filePath };
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
    * Handle an import statement based on http
    * @param url The url of the import statement
    * @param cleanUrl
    */
    handleHttp(url, cleanUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-useless-catch
            try {
                const response = yield axios_1.default.get(url);
                return { content: response.data, cleanUrl };
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
    * Handle an import statement based on https
    * @param url The url of the import statement
    * @param cleanUrl
    */
    handleHttps(url, cleanUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-useless-catch
            try {
                const response = yield axios_1.default.get(url);
                return { content: response.data, cleanUrl };
            }
            catch (e) {
                throw e;
            }
        });
    }
    handleSwarm(url, cleanUrl) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-useless-catch
            try {
                const bzz = new bzz_node_1.BzzNode({ url: this.protocol + '//swarm-gateways.net' });
                const url = bzz.getDownloadURL(cleanUrl, { mode: 'raw' });
                const response = yield axios_1.default.get(url);
                return { content: response.data, cleanUrl };
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
    * Handle an import statement based on IPFS
    * @param url The url of the IPFS import statement
    */
    handleIPFS(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // replace ipfs:// with /ipfs/
            url = url.replace(/^ipfs:\/\/?/, 'ipfs/');
            // eslint-disable-next-line no-useless-catch
            try {
                const req = 'https://ipfsgw.komputing.org/' + url;
                // If you don't find greeter.sol on ipfs gateway use local
                // const req = 'http://localhost:8080/' + url
                const response = yield axios_1.default.get(req);
                return { content: response.data, cleanUrl: url };
            }
            catch (e) {
                throw e;
            }
        });
    }
    /**
    * Handle an import statement based on NPM
    * @param url The url of the NPM import statement
    */
    handleNpmImport(url) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-useless-catch
            try {
                const req = 'https://unpkg.com/' + url;
                const response = yield axios_1.default.get(req);
                return { content: response.data, cleanUrl: url };
            }
            catch (e) {
                throw e;
            }
        });
    }
    getHandlers() {
        return [
            {
                type: 'github',
                match: (url) => { return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url); },
                handle: (match) => this.handleGithubCall(match[3], match[4])
            },
            {
                type: 'http',
                match: (url) => { return /^(http?:\/\/?(.*))$/.exec(url); },
                handle: (match) => this.handleHttp(match[1], match[2])
            },
            {
                type: 'https',
                match: (url) => { return /^(https?:\/\/?(.*))$/.exec(url); },
                handle: (match) => this.handleHttps(match[1], match[2])
            },
            {
                type: 'swarm',
                match: (url) => { return /^(bzz-raw?:\/\/?(.*))$/.exec(url); },
                handle: (match) => this.handleSwarm(match[1], match[2])
            },
            {
                type: 'ipfs',
                match: (url) => { return /^(ipfs:\/\/?.+)/.exec(url); },
                handle: (match) => this.handleIPFS(match[1])
            },
            {
                type: 'npm',
                match: (url) => { return /^[^/][^\n"?:*<>|]*$/g.exec(url); },
                handle: (match) => this.handleNpmImport(match[0])
            }
        ];
    }
    resolve(filePath, customHandlers) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let imported = this.previouslyHandled[filePath];
            if (imported) {
                return imported;
            }
            const builtinHandlers = this.getHandlers();
            const handlers = customHandlers ? [...builtinHandlers, ...customHandlers] : [...builtinHandlers];
            const matchedHandler = handlers.filter(handler => handler.match(filePath));
            const handler = matchedHandler[0];
            const match = handler.match(filePath);
            const { content, cleanUrl } = yield handler.handle(match);
            imported = {
                content,
                cleanUrl: cleanUrl || filePath,
                type: handler.type
            };
            this.previouslyHandled[filePath] = imported;
            return imported;
        });
    }
}
exports.RemixURLResolver = RemixURLResolver;
//# sourceMappingURL=resolve.js.map