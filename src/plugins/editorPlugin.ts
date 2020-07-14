import { Annotation } from "./type";
import { CommandPlugin } from "@remixproject/engine-vscode";

const profile = {
  name: "editor",
  displayName: "Native Editor plugin for Remix vscode plugin",
  description: "Provides communication between vscode editor and remix-plugin",
  kind: "editor",
  permission: true,
  location: "sidePanel",
  documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: ["discardHighlight", "highlight"],
};

export default class EditorPlugin extends CommandPlugin {
  constructor() {
    super(profile);
  }
  highlight(position: Position, filePath: string, hexColor: string): void {
	console.log("TODO: highlight");
    return;
  }
  discardHighlight(): void {
    console.log("TODO: discardHighlight");
    return;
  }
  discardHighlightAt(line: number, filePath: string): void {
    return;
  }
  addAnnotation(annotation: Annotation): void {
    return;
  }
  clearAnnotations(): void {
    return;
  }
}
