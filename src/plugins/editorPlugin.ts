import { Annotation, RemixPosition } from "./type";
import { CommandPlugin } from "@remixproject/engine-vscode";
import { window, Range, TextEditorDecorationType, Position } from "vscode";

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
  private decoration: TextEditorDecorationType;
  constructor() {
    super(profile);
    this.decoration = window.createTextEditorDecorationType({
      backgroundColor: 'editor.lineHighlightBackground',
      isWholeLine: true,
    });
  }
  highlight(position: RemixPosition, filePath: string, hexColor: string): void {
    const editor = window.activeTextEditor;
    const start: Position = new Position(position.start.line, position.start.column);
    const end: Position = new Position(position.end.line, position.end.column);
    const newDecoration = { range: new Range(start, end) };
    if(hexColor) {
      this.decoration = window.createTextEditorDecorationType({
        backgroundColor: hexColor,
        isWholeLine: true,
      });
    }
    editor.setDecorations(this.decoration, [newDecoration]);
  }
  discardHighlight(): void {
    this.decoration.dispose();
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
