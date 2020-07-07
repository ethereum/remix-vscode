import { PluginInfo } from './types';
import { ViewColumn } from "vscode";
import { PluginData } from "./pluginlist";

export function ToViewColumn(pluginData: PluginInfo) {
	switch (pluginData.location) {
		case "sidePanel":
			return ViewColumn.Two;
		default:
			return ViewColumn.Active;
	}
}

export function GetPluginData(pluginId: string): PluginInfo {
	const p: PluginInfo[] = PluginData.filter(i => {
		return i.name == pluginId;
	});
	return p[0];
}