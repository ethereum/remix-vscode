import {
	Plugin
} from '@remixproject/engine'
import git from 'isomorphic-git'
import IpfsHttpClient from 'ipfs-http-client'
import { absolutePath, relativePath } from '@remixproject/engine-vscode/util/path'
import { window, workspace, Uri, commands, ViewColumn, InputBoxOptions } from 'vscode'
const nodepath = require('path')

const profile = {
	name: 'dGitProvider',
	displayName: 'Decentralized git',
	description: '',
	icon: 'assets/img/fileManager.webp',
	version: '0.0.1',
	methods: ['init', 'status', 'log', 'commit', 'add', 'remove', 'rm', 'lsfiles', 'readblob', 'resolveref', 'branches', 'branch', 'checkout', 'currentbranch', 'push', 'pull', 'setIpfsConfig', 'zip'],
	kind: 'file-system'
}
export default class DGitProvider extends Plugin {
	ipfsconfig: any
	ipfs: any
	filesToSend: any[]
	constructor() {
		super(profile)
		this.ipfsconfig = {
			host: 'ipfs.komputing.org',
			port: 443,
			protocol: 'https',
			ipfsurl: 'https://ipfsgw.komputing.org/ipfs/'
		}
	}

	async getGitConfig() {

	}

	async init() {

	}

	async status(cmd) {

	}

	async add(cmd) {

	}

	async rm(cmd) {

	}

	async checkout(cmd) {

	}

	async log(cmd) {

	}

	async branch(cmd) {

	}

	async currentbranch() {

	}

	async branches() {

	}

	async commit(cmd) {

	}

	async lsfiles(cmd) {

	}

	async resolveref(cmd) {

	}

	async readblob(cmd) {

	}

	async setIpfsConfig(config) {
		this.ipfsconfig = config
		return new Promise((resolve, reject) => {
			resolve(this.checkIpfsConfig())
		})
	}

	async checkIpfsConfig() {
		this.ipfs = IpfsHttpClient(this.ipfsconfig)
		try {
			await this.ipfs.config.getAll()
			return true
		} catch (e) {
			return false
		}
	}

	async push() {

		if (!this.checkIpfsConfig()) return false
		let files = await this.getDirectory('')
		this.filesToSend = []
		for (const file of files) {
			const absPath = absolutePath(file)
			const uri = Uri.file(absPath)
			const c = ""
			const v = await workspace.fs.readFile(uri)
			console.log(v)
			const ob = {
				path: file,
				content: v
			}
			this.filesToSend.push(ob)
		}
		const addOptions = {
			wrapWithDirectory: true
		}
		console.log(this.filesToSend)
		const r = await this.ipfs.add(this.filesToSend, addOptions)
		console.log(r.cid.string)
		return r.cid.string
	}

	async pull(cmd) {
		//const cid = cmd.cid
		//let cid = "QmYMX1RnqPBe1NdMjKyTKZKjvRi2KzW5GSmxiNC3JDmRHS"
		let options: InputBoxOptions = {
			prompt: "Clone from Remix using IPFS?",
			value: cmd
		}
		
		const input = await window.showInputBox(options)
		if(!input || input ==="")
			return

		const cid = input
		if (!this.checkIpfsConfig()) return false
		for await (const file of this.ipfs.get(cid)) {
			file.path = file.path.replace(cid, '')
			if (!file.content) {
				continue
			}
			const content = []
			for await (const chunk of file.content) {
				content.push(chunk)
			}
			const dir = nodepath.dirname(file.path)
			try {
				//console.log("create dir ", dir)
			} catch (e) {}
			try {
				const absPath = absolutePath(`${file.path}`);
				const uri = Uri.file(absPath);
				await workspace.fs.writeFile(uri, Buffer.concat(content))
				console.log("create file ", uri.path)
			} catch (e) {}
		}
	}

	async zip() {

	}

	async createDirectories(strdirectories) {
		const ignore = ['.', '/.', '']
		if (ignore.indexOf(strdirectories) > -1) return false
		const directories = strdirectories.split('/')
		for (let i = 0; i < directories.length; i++) {
			let previouspath = ''
			if (i > 0) previouspath = '/' + directories.slice(0, i).join('/')
			const finalPath = previouspath + '/' + directories[i]
			try {
				//window.remixFileSystem.mkdirSync(finalPath)
			} catch (e) {}
		}
	}

	async getDirectory(dir) {
		let result = []
		let files
		try{
			files = await this.call("fileManager","readdir",dir)
		}catch(e){
			console.log(e)
			return
		}

		const fileArray = normalize(files)

		//console.log(fileArray)
		
		for (const fi of fileArray) {
			if (fi) {
				const type = fi.data.isDirectory
				if (type === true) {
					result = [
						...result,
						...(await this.getDirectory(
							`${fi.filename}`
						))
					]
				} else {
					result = [...result, fi.filename]
				}
			}
		}
		return result
	}
}

const normalize = (filesList) => {
	const folders = []
	const files = []
	Object.keys(filesList || {}).forEach(key => {
		if (filesList[key].isDirectory) {
			folders.push({
				filename: key,
				data: filesList[key]
			})
		} else {
			files.push({
				filename: key,
				data: filesList[key]
			})
		}
	})
	return [...folders, ...files]
}

