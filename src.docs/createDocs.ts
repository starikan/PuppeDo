import path from 'path';
import fs from 'fs';

import { documentations } from '../src/Plugins/index';
import { DocumentationLanguages } from '../src/global.d';

const languageDefault = 'en';
const languages: DocumentationLanguages[] = ['en', 'ru'];
const parts = ['title', 'installation', 'old', 'arguments'];

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

  const plugins = [];
  plugins.push('\n# Plugins\n');
  for (const plugin of documentations) {
    const documentation = plugin;
    plugins.push(`## ${documentation.name}`);
    documentation.description[lang].forEach((line) => plugins.push(`${line}\n`));

    if (documentation.exampleTest) {
      const exampleTest = fs.readFileSync(path.join(__dirname, '..', documentation.exampleTest), 'utf-8');
      plugins.push(`\`\`\`yaml\n${exampleTest}\n\`\`\``);
    }

    if (documentation.exampleTestResult) {
      const exampleTestResult = fs
        .readFileSync(path.join(__dirname, '..', documentation.exampleTestResult), 'utf-8')
        // eslint-disable-next-line no-control-regex
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
