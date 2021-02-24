import { PluginInfo } from './types';
import { ViewColumn } from "vscode";

export function ToViewColumn(pluginData: PluginInfo) {
	switch (pluginData.location) {
		case "sidePanel":
			return ViewColumn.Two;
		default:
			return ViewColumn.Active;
	}
}

export function GetPluginData(pluginId: string, defaultPluginData:PluginInfo[]): PluginInfo {
	const p: PluginInfo[] = defaultPluginData.filter(i => {
		return i.name == pluginId;
	});
	return p[0];
}