/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable security/detect-non-literal-require */

import path from 'path';
import fs from 'fs';

import { documentations } from '../src/Plugins/index';
// import { PluginDocumentation } from '../src/global.d';

const targetFile = path.join(__dirname, '../README.md');
const index = fs.readFileSync(path.join(__dirname, './index.md'), 'utf-8');

const title = fs.readFileSync(path.join(__dirname, './title.md'), 'utf-8');
const installation = fs.readFileSync(path.join(__dirname, './installation.md'), 'utf-8');
const old = fs.readFileSync(path.join(__dirname, './old.md'), 'utf-8');

const plugins = [];
plugins.push('\n## Plugins\n');
for (const plugin of documentations) {
  const documentation = plugin;
  plugins.push(`### ${documentation.name}`);
  documentation.description.forEach((line) => plugins.push(`${line}\n`));
  plugins.push('\n---');
}

const replaces = {
  title,
  old,
  installation,
  plugins: plugins.join('\n'),
};

let result = index;

Object.keys(replaces).forEach((key) => {
  result = result.replace(`%${key}%`, replaces[key]);
});

// plugins.push(fs.readFileSync(old, 'utf8'));

fs.writeFileSync(targetFile, result);
