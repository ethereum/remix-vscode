# Ethereum Remix Project extension for Visual Studio Code
This project brings Remix plugins to Visual Studio Code.<br>Remix plugins can perform a variety of tasks such as verifying contracts, linting, generating documentation, running tutorials, compiling, debugging and much more.<br>The Remix Plugin API allows plugins that run in Remix to run in Visual Studio Code too.<br>
It allows developers to access and interact with the file system, components, extensions and other Remix plugins without actually having to create a different code base.

For more info on what Remix is and what plugins do please visit our [Remix IDE](https://remix.ethereum.org/) and [Remix Project website](https://remix-project.org/)

- [Ethereum Remix Project extension for Visual Studio Code](#ethereum-remix-project-extension-for-visual-studio-code)
  - [A beta release.](#a-beta-release)
  - [Installation from the Visual Studio Code Marketplace](#installation-from-the-visual-studio-code-marketplace)
  - [Requirements](#requirements)
  - [Compiling Solidity & Yul](#compiling-solidity--yul)
  - [Imports](#imports)
  - [Deploying contracts](#deploying-contracts)
  - [RemixD](#remixd)
  - [The plugins](#the-plugins)
  - [Select, activate, deactivate a plugin](#select-activate-deactivate-a-plugin)
  - [Load a development plugin](#load-a-development-plugin)
  - [Contributing and development](#contributing-and-development)

## A beta release. 

As we are continuing development of Remix and the Plugin API more functionalities will open up.<br>So at first it might feel limited. In this beta release we show you a glimpse of what the possibilities are, inviting everybody to contribute & comment.

## Installation from the Visual Studio Code Marketplace
[Install from Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RemixProject.ethereum-remix)


## Requirements

Before being able to use the extension, you need to have at least a folder opened or a workspace.

## Compiling Solidity & Yul

Our extension provides some basic functionality to get started with Solidity and Yul development.<br>Quite a few remix plugins use the results of compilation to generate content for you. So this is extremely useful.

At this time you can compile your files using two methods:
* the internal Remix compiler
* the compiler provided by the Solidity Extension (https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)

The compiler can be accessed via the menu. Just open a solidity file in the editor and click on compile, you will be able to select a file to compile.

## Imports 

Just like Remix the extension handles any imports you may have in your files.

## Deploying contracts

The Run & Deploy app provides several options for you to connect to a network, deploy contracts and run transactions.

## RemixD

RemixD is a daemon which allows you to connect your local filesystem to Remix IDE. In the context of this extension it also allows you to deploy to the Remix VM or to Metamask if this has been installed in your browser.

## The plugins

The extension loads with a default set of plugins. As time goes on we will add more plugins.<br>You can also suggest and create plugins using our plugin system and API. Feel free to contact us on our gitter channels.
[Remix](https://gitter.im/ethereum/remix) & [Remix Dev](https://gitter.im/ethereum/remix-dev) and read up on the basics
on [Read the docs](https://remix-plugins-directory.readthedocs.io/en/latest/)
## Select, activate, deactivate a plugin

Before you can use a plugin, it needs to be activated. Activation means you open it and it will run.

![Activate, deactivate remix plugin](https://j.gifs.com/2xn4KP.gif)

## Load a development plugin

As you develop your own plugin or you want to try out a plugin by using a custom URL you can easily add it to the list.

* Click on 'add plugin' from the `Remix Plugins More actions` menu on top right
<p align="justify">
  <img src="https://raw.githubusercontent.com/ethereum/remix-vscode/master/media/doc-addplugin.png">
</p>

* The plugin system requires a valid JSON string that contains the information needed.
  Add your `JSON` plugin info into the input box. An example is given below.

  The URL can contain any URL or a local file.<br>Make sure to give your plugin a unique name. You can't have two plugins with the same name.
```json
{
  "name": "dev-plugin",
  "displayName": "My first plugin",
  "methods": [],
  "version": "0.0.1-dev",
  "url": "http://localhost:3000",
  "description": "A great plugin for the Remix project",
  "icon": "https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png",
  "location": "sidePanel"
}
```

<p align="justify">
  <img src="https://raw.githubusercontent.com/ethereum/remix-vscode/master/media/doc-addplugin2.png">
</p>


## Contributing and development

You can checkout our code on [github](https://github.com/ethereum/remix-vscode)
* Make sure the extension from the marketplace is not installed, running both versions will not work.
* Open up the repo in Visual Studio Code.
* run Yarn
* hit F5
* A new Visual Studio Code window will open where the extension is running.