import { OutputChannel, window, workspace } from "vscode";
import { Plugin } from "@remixproject/engine";
export type TerminalMessage = {
  value: any;
  type: "html" | "log" | "info" | "warn" | "error";
};

let cache: string = ""

const profile = {
  displayName: "Terminal",
  name: "terminal",
  methods: ["log"],
  events: [],
  description: " - ",
  version: "0.1",
};

export default class Terminal extends Plugin {
  private outputChannel: OutputChannel;
  constructor() {
    super(profile);
    this.outputChannel = window.createOutputChannel("Remix IDE");
  }

  async log(msg: any) {
    if(!msg) return
    if (typeof msg == "string") {
      this.print(msg);
    } else {
      this.print(msg.value);
    }
  }

  // terminal printing
  private getNow(): string {
    const date = new Date(Date.now());
    return date.toLocaleTimeString();
  }

  private print(m: string) {
    if(cache === m) return
    cache = m
    const now = this.getNow();
    this.outputChannel.appendLine(`[${now}]: ${m}`);
    this.outputChannel.show();
  }
}
