import { Plugin } from '@remixproject/engine';

export default class IframePlugin extends Plugin {
	constructor() {
		super({ name: 'iframe-plugin', methods: ['getVersion'] });
	}
	getVersion() {
		return 0.1;
	}
}