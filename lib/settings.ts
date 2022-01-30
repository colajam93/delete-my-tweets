import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface Setting {
  userName: string;
}

export function loadSetting(path: string): Setting {
  return yaml.load(fs.readFileSync(path, 'utf8')) as Setting;
}
