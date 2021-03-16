# Remix Plugins for Visual Studio Code
This project aims to provide a similar interface like Visual Studio Code extension manager but for Remix plugins.

For more info on what Remix is and what plugins do please visit our [Remix IDE](https://remix.ethereum.org/) and [Remix Project website](https://remix-project.org/)

- [Remix Plugins for Visual Studio Code](#remix-plugins-for-visual-studio-code)
  - [Installation from the Visual Studio Code Marketplace](#installation-from-the-visual-studio-code-marketplace)
  - [Requirements](#requirements)
  - [The plugins](#the-plugins)
  - [Select, activate, deactivate a plugin](#select-activate-deactivate-a-plugin)
  - [Load a development plugin](#load-a-development-plugin)
  - [Compiling Solidity & Yul](#compiling-solidity--yul)
  - [Contributing and development](#contributing-and-development)

## Installation from the Visual Studio Code Marketplace
[Install from Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Ethential.code-remix)


## Requirements

Before being able to use the extension, you need to have at least a folder opened or a workspace.

## The plugins

The extension loads with a default set of plugins. As time goes on we will add more plugins.  The plugin system allows developers to access and interact with the file system and other components, plugins and extensions.

You can also suggest and create plugins using our plugin system and API. Feel free to contact us on our gitter channels.
[Remix](https://gitter.im/ethereum/remix) & [Remix Dev](https://gitter.im/ethereum/remix-dev) and read up on the basics
on [Read the docs](https://remix-plugins-directory.readthedocs.io/en/latest/)
## Select, activate, deactivate a plugin

Before you can use a plugin, it needs to be activated. Activation means you open it and it will run.

![Activate, deactivate remix plugin](https://j.gifs.com/2xn4KP.gif)

## Load a development plugin

As you develop your own plugin or you want to try out a plugin by using a custom URL you can easily add it to the list.

* Click on add plugin button from `Remix Plugins More actions` menu on top right
<p align="justify">
  <img src="https://raw.githubusercontent.com/ethereum/remix-vscode/master/media/doc-addplugin.png">
</p>

* The plugin system requires a valid JSON string that contains the information needed.
  Add your `JSON` plugin info into the input box. An example is given below.

  The URL can contain any URL or a local file.
```json
{
  "name": "solhint-dev",
  "displayName": "Solhint development",
  "methods": [],
  "version": "0.0.1-dev",
  "url": "/home/0mkar/Karma/remix-solhint-plugin",
  "description": "Run Solhint in your Remix project",
  "icon": "https://raw.githubusercontent.com/protofire/solhint/master/solhint-icon.png",
  "location": "sidePanel"
}
```
<p align="justify">
  <img src="https://raw.githubusercontent.com/ethereum/remix-vscode/master/media/doc-addplugin2.png">
</p>

## Compiling Solidity & Yul

Our extension provides some basic functionality to get started with Solidity and Yul development.<br>Quite a few remix plugins use the results of compilation to generate content for you. So this is extremely useful.

At this time you can compile your files using two methods:
* the internal Remix compiler
* the compiler provided by the Solidity Extension (https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)

Compiling with the Solidity extension provides some extra features that are included in the Solidity extension.

*Warning: when you have the Solidity extension installed you usually hit F5 to compile.<br>This will not work (yet) in conjunction with Remix.<br>You
should compile with the 'Compile with Solidity extension'. This way you get the benefits of both extensions.*

To compile use the command palette ( Shift+cmd+p ) and type in REMIX. You will see both options there.

<p align="justify">
  <img src="https://raw.githubusercontent.com/ethereum/remix-vscode/master/media/compile.png">
</p>

## Contributing and development

You can checkout our code on [github](https://github.com/ethereum/remix-vscode)
* Make sure the extension from the marketplace is not installed, otherwise there will be conflicts
* Open up the repo in Visual Studio Code
* run Yarn
* hit F5
* A new Visual Studio Code window will open where the extension is running