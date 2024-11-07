import * as fs from 'fs';
import { walkSync } from '../src/Helpers';

export function createTextFile(directoryPaths: string[], extensions: string[]) {
  const outputPath = './output/output.txt'; // Путь для сохранения результирующего

  const filePaths = [
    ...directoryPaths
      .map((v) =>
        walkSync(v, {
          extensions: extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)),
          ignoreFolders: [],
          ignoreFiles: [],
          depth: 1,
        }),
      )
      .flat(),
  ];
  let fileContents = '';

  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    fileContents += `File: ${filePath}\n\n${fileContent}\n\n`;
  }

  fs.writeFileSync(outputPath, fileContents);
  console.log(`Text file created: ${outputPath}`);
}

// Получаем аргументы командной строки
const args = process.argv.slice(2);

// Проверяем, что переданы аргументы
if (args.length < 2) {
  console.error('Please provide directory paths and file extensions as arguments.');
  process.exit(1);
}

// Первые аргументы - пути к директориям
const directoryPaths = args.slice(0, args.length - 1);

// Последний аргумент - расширения файлов
const extensions = args[args.length - 1].split(',');

// Вызываем функцию createTextFile с переданными аргументами
createTextFile(directoryPaths, extensions);
