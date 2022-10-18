import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface SlackSetting {
  readonly channelConfigurationName: string;
  readonly channelId: string;
  readonly workspaceId: string;
}

export interface Setting {
  readonly userName: string;
  readonly slack: SlackSetting;
}

export function loadSetting(path: string): Setting {
  return yaml.load(fs.readFileSync(path, 'utf8')) as Setting;
}
