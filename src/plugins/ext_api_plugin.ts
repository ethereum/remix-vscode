import { extensions } from "vscode";
import { CommandPlugin } from "@remixproject/engine-vscode";

const profile = {
  name: 'vscodeExtAPI',
  displayName: 'Extension API connector',
  description: 'Connects VScode Extension API with remix plugins.',
  kind: 'connector',
  permission: true,
  documentation: 'https://remix-ide.readthedocs.io/en/latest/solidity_editor.html',
  version: '0.0.1',
  methods: ['exec']
};
export class ExtAPIPlugin extends CommandPlugin {
	constructor() {
		super(profile);
	}
	async exec(extName: string, cmdName: string, params: Array<any>) {
		const ext = extensions.getExtension(extName);
    await ext.activate();
    const extAPI = ext.exports;
    extAPI[cmdName](...params);
	}
}