import {Profile} from '@remixproject/engine';
export interface PluginInfo {
  name: string;
  displayName: string;
  description: string;
  methods?: (string | null)[] | null;
  events?: null[] | null;
  version?: string | null;
  url: string;
  icon: string;
  location: string;
  kind?: string | null;
  notifications?: Notifications | null;
  documentation?: string | null;
  permission?: boolean;
}
interface Notifications {
  solidity?: string[] | null;
  udapp?: string[] | null;
  network?: string[] | null;
}
export interface PluginProfile extends Profile {
  version?: string | number;
}