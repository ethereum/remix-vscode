import { Plugin } from "@remixproject/engine";
import { workspace, Uri, ExtensionContext } from "vscode";

const profile = {
	name: 'settings',
	displayName: 'Settings',
	methods: ['getGithubAccessToken', 'get'],
	events: [],
	icon: 'assets/img/settings.webp',
	description: 'Remix-IDE settings',
	kind: 'settings',
	documentation: '',
	version: '0.0.1',
  }

  export default class SettingsModule extends Plugin {
	context: ExtensionContext
	constructor() {
		super(profile);
	}
	getGithubAccessToken () {
		return ''
	}

	setContext(context: ExtensionContext){
		this.context = context
	}

	get(key: string){
		if(key === 'settings/generate-contract-metadata'){
			return true
		}
		return this.context.workspaceState.get(key) 
	}

	set(key: string, value: any){
		this.context.workspaceState.update(key, value)
	}

  }