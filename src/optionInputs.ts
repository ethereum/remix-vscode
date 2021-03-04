/**
 * Shows a pick list using window.showQuickPick().
 */
import { commands, ExtensionContext  } from 'vscode';

/**
 * Activate a plugin
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
export async function pluginActivate(context: ExtensionContext, pluginId: string) {
	commands.executeCommand('extension.activateRmxPlugin', pluginId)
}

/**
 * Deactivate a plugin with given id
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
export async function pluginDeactivate(context: ExtensionContext, pluginId: string) {
	commands.executeCommand('extension.deActivateRmxPlugin', pluginId);
}

/**
 * Uninstall a plugin with given id
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
export async function pluginUninstall(context: ExtensionContext, pluginId: string) {
	commands.executeCommand('rmxPlugins.uninstallRmxPlugin', pluginId);
}

/**
 * Open Documentation
 * @param context vscode Execution context
 * @param pluginId plugin ID mentioned as plugin ViewItem
 */
export async function pluginDocumentation(context: ExtensionContext, pluginId: string) {
	commands.executeCommand('rmxPlugins.openDocumentation', pluginId);
}