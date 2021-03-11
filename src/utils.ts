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

export function GetPluginData(pluginId: string, data:PluginInfo[]): PluginInfo {
	const p: PluginInfo[] = data.filter(i => {
		return i.name == pluginId;
	});
	return p[0];
}