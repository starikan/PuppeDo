import path from 'path';
import fs from 'fs';

import { pluginsListDefault } from '../src/Defaults';
import { PluginsFabric } from '../src/PluginsCore';
import { DocumentationLanguages } from '../src/model';

const languageDefault = 'en';
const languages: DocumentationLanguages[] = ['en', 'ru'];

const index = fs.readFileSync(path.join(__dirname, './index.md'), 'utf-8');
const parts = [...index.matchAll(/%(\w+?)%/g)].map((v) => v[1]).filter((v) => !['plugins'].includes(v));

const allPlugins = new PluginsFabric(pluginsListDefault);

languages.forEach((lang) => {
  const replaces: Record<string, string> = {};

  parts.forEach((part) => {
    try {
      const defaultFile = path.join(__dirname, languageDefault, `${part}.md`);
      const partFile = path.join(__dirname, lang, `${part}.md`);
      const partData = fs.existsSync(partFile)
        ? fs.readFileSync(partFile, 'utf-8')
        : fs.readFileSync(defaultFile, 'utf-8');
      replaces[part] = partData;
    } catch (error) {
      console.log(`Can't find ${part} file`);
    }
  });

  const plugins: string[] = [];
  plugins.push('\n# Test block settings\n');
  for (const plugin of allPlugins.getDocs()) {
    const documentation = plugin;
    plugins.push(`## ${documentation.name}`);
    (documentation?.description[lang] ?? []).forEach((line) => plugins.push(`${line}\n`));

    for (const example of documentation.examples) {
      const exampleTest = fs.readFileSync(path.join(__dirname, '..', example.test), 'utf-8');
      plugins.push(`\`\`\`yaml\n${exampleTest}\n\`\`\``);

      const exampleTestResult = fs
        .readFileSync(path.join(__dirname, '..', example.result), 'utf-8')
        .replace(/\[\d{1,2}m/g, '');
      plugins.push('#### Output:');
      plugins.push(`\`\`\`\n${exampleTestResult}\n\`\`\``);
    }
  }
  replaces.plugins = plugins.join('\n');

  let result = fs.readFileSync(path.join(__dirname, './index.md'), 'utf-8');
  Object.keys(replaces).forEach((key) => {
    result = result.replace(`%${key}%`, replaces[key]);
  });

  const targetFile = path.join(__dirname, '../docs', `${lang}.md`);
  fs.writeFileSync(targetFile, result);
});
