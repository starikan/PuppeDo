/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable security/detect-non-literal-require */

import path from 'path';
import fs from 'fs';

import { documentations } from '../src/Plugins/index';
// import { PluginDocumentation } from '../src/global.d';

const languageDefault = 'en';
const languages = ['en', 'ru'];
const parts = ['title', 'installation', 'old'];

languages.forEach((lang) => {
  const replaces: Record<string, string> = {};

  parts.forEach((part) => {
    const defaultFile = path.join(__dirname, languageDefault, `${part}.md`);
    const partFile = path.join(__dirname, lang, `${part}.md`);
    const partData = fs.existsSync(partFile)
      ? fs.readFileSync(partFile, 'utf-8')
      : fs.readFileSync(defaultFile, 'utf-8');
    replaces[part] = partData;
  });
  // const title = fs.readFileSync(path.join(__dirname, './title.md'), 'utf-8');
  // const installation = fs.readFileSync(path.join(__dirname, './installation.md'), 'utf-8');
  // const old = fs.readFileSync(path.join(__dirname, './old.md'), 'utf-8');

  const plugins = [];
  plugins.push('\n## Plugins\n');
  for (const plugin of documentations) {
    const documentation = plugin;
    plugins.push(`### ${documentation.name}`);
    documentation.description[lang].forEach((line) => plugins.push(`${line}\n`));
    plugins.push('\n---');
  }
  replaces.plugins = plugins.join('\n');

  let result = fs.readFileSync(path.join(__dirname, './index.md'), 'utf-8');
  Object.keys(replaces).forEach((key) => {
    result = result.replace(`%${key}%`, replaces[key]);
  });

  // plugins.push(fs.readFileSync(old, 'utf8'));

  const targetFile = path.join(__dirname, '../docs', `${lang}.md`);
  fs.writeFileSync(targetFile, result);
});