# Remix Plugins manager
This project aims to provide a similar interface like vscode extension manager but for Remix plugins.

## Development
```
yarn
code .
[start plugin with F5]
```
## Installation
* Download vsix and install: http://gateway.ipfs.io/ipfs/QmcuwVaMdesZJcNUZc5N2fdmpCedweYw9junaHtCTKUw75
## Select, activate, deactivate plugin
<p align="justify">
  <img src="https://user-images.githubusercontent.com/13261372/91587016-d0b11b00-e973-11ea-8371-cf991d329c60.png" height="400">
</p>

## Screenshots
<p align="justify">
  <img src="https://user-images.githubusercontent.com/13261372/91586411-f38eff80-e972-11ea-83fe-a7f798b9a160.png" height="600">
</p>

## Load plugin from local source

```json
{
    name: "solhint",
    displayName: "Solhint",
    methods: [],
    version: "0.0.1",
    url: "/home/0mkar/Karma/remix-solhint-plugin",
    description: "Run Solhint in your Remix project",
    icon: "https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png",
    location: "sidePanel",
  },
  {
    name: "source-verification",
    displayName: "Sourcify",
    description: "Source metadata fetcher and validator",
    version: "0.5.2-beta",
    documentation: "https://github.com/sourcifyeth/remix-sourcify",
    methods: [
      "fetch",
      "fetchAndSave",
      "fetchByNetwork",
      "verify",
      "verifyByNetwork"
    ],
    icon: "https://raw.githubusercontent.com/Shard-Labs/remix-contract-getter/master/public/sourcify.png",
    location: "sidePanel",
    url: "/home/0mkar/Karma/remix-sourcify/dist",
  },
  ```