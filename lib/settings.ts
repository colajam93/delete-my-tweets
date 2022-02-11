import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface SlackSetting {
  channelConfigurationName: string;
  channelId: string;
  workspaceId: string;
}

export interface Setting {
  userName: string;
  slack: SlackSetting;
}

export function loadSetting(path: string): Setting {
  return yaml.load(fs.readFileSync(path, 'utf8')) as Setting;
}
