import { FileManagerPlugin } from "@remixproject/engine-vscode";
import {
  relativePath,
  absolutePath,
} from "@remixproject/engine-vscode/util/path";
import { workspace, Uri, ExtensionContext, FileStat, FileType } from "vscode";
export default class VscodeFileManager extends FileManagerPlugin {
  type: string;
  context: ExtensionContext;
  constructor() {
    super();
    this.type = "localhost";
    this.methods = [
      ...this.methods,
      "getOpenedFiles",
      "exists",
      "getProviderByName",
      "getProviderOf",
      "isDirectory"
    ];
  }

  /**
   * Async API method getProviderOf
   * @param {string} file
   *
   */

  async getProviderOf(file: string) {
    return this.currentFileProvider()
  }

  /**
   * Async API method getProviderByName
   * @param {string} name
   *
   */

  async getProviderByName(name: string) {
    return this.currentFileProvider()
  }

  setContext(context: ExtensionContext) {
    this.context = context;
  }

  addNormalizedName(path, url) {
    this.context.workspaceState.update(this.type + "/" + path, url);
    this.context.workspaceState.update(
      "reverse-" + url,
      this.type + "/" + path
    );
  }

  getNormalizedName(path) {
    return this.context.workspaceState.get(path);
  }

  getPathFromUrl(url) {
    return this.context.workspaceState.get("reverse-" + url);
  }

  currentFileProvider() {
    return this;
  }

  getProvider(type: string) {
    return this;
  }

  fileProviderOf(url) {
    //console.log("PROVIDER of ", url);
    return this;
  }

  getOpenedFiles() {
    return workspace.textDocuments.map((x) => relativePath(x.fileName));
  }

  isConnected() {
    return true;
  }

  isDirectory(path){
    path = this.getPathFromUrl(path) || path;
    var unprefixedpath = this.removePrefix(path);
    const absPath = absolutePath(unprefixedpath);
    const uri = Uri.file(absPath);
    //console.log(uri);
    return new Promise((resolve, reject) => {
      try {
        workspace.fs.stat(uri).then(

          (value: FileStat) => {
            resolve(value.type === FileType.Directory);
          },
          () => {
            resolve(false);
          }
        );
      } catch (e) {
        reject();
      }
    });
  }

  exists(path) {
    path = this.getPathFromUrl(path) || path;
    var unprefixedpath = this.removePrefix(path);
    const absPath = absolutePath(unprefixedpath);
    const uri = Uri.file(absPath);
    //console.log(uri);
    return new Promise((resolve, reject) => {
      try {
        workspace.fs.stat(uri).then(
          (value: FileStat) => {
            resolve(true);
          },
          () => {
            resolve(false);
          }
        );
      } catch (e) {
        reject();
      }
    });
  }

  removePrefix(path) {
    path = path.indexOf(this.type) === 0 ? path.replace(this.type, "") : path;
    if (path === "") return "/";
    return path;
  }

  get(path: any, cb) {
    cb = cb || function () {};
    path = this.getPathFromUrl(path) || path;
    var unprefixedpath = this.removePrefix(path);
    this.exists(unprefixedpath).then(
      () => {
        this.readFile(unprefixedpath).then(
          (content) => {
            cb(null, content);
          },
          () => {
            cb(null, null);
          }
        );
      },
      () => {
        cb(null, null);
      }
    );
  }

  set(path: string, content: string, cb) {
    cb = cb || function () {};
    var unprefixedpath = this.removePrefix(path);
    try {
      console.log("write to", unprefixedpath);
      this.writeFile(unprefixedpath, content).then(() => {
        cb();
      });
    } catch (e) {
      cb(e);
    }
  }

  addExternal(path, content, url) {
    if (url) this.addNormalizedName(path, url);
    return this.set(path, content, undefined);
  }
}
