import { FileManagerPlugin } from "@remixproject/engine-vscode";
import { relativePath } from "@remixproject/engine-vscode/util/path";
import { filSystemProfile, IFileSystem } from '@remixproject/plugin-api'
import { workspace } from "vscode";
export default class VscodeFileManager extends FileManagerPlugin {
	constructor() {
		super()
		this.methods = [... this.methods, "getOpenedFiles"]
	}

	getOpenedFiles() {
		return workspace.textDocuments.map((x)=>relativePath(x.fileName))
	}
}