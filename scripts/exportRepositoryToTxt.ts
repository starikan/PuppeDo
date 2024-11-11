import * as fs from 'fs';
import { walkSync } from '../src/Helpers';

interface CreateTextFileOptions {
  directoryPaths: string[];
  extensions: string[];
  depth?: number;
}

export function createTextFile(options: CreateTextFileOptions) {
  const outputPath = './output/output.txt'; // Путь для сохранения результирующего

  const filePaths = [
    ...options.directoryPaths
      .map((v) =>
        walkSync(v, {
          includeExtensions: options.extensions.map((ext) => (ext.startsWith('.') ? ext : `.${ext}`)),
          ignoreFolders: [],
          ignoreFiles: [],
          depth: options.depth,
        }),
      )
      .flat(),
  ];
  let fileContents = '';

  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    fileContents += `=================================\nFile: ${filePath}\n\n${fileContent}\n\n`;
  }

  fs.writeFileSync(outputPath, fileContents);
  console.log(`Text file created: ${outputPath}`);
}

// Читаем параметры из переменных окружения
const options: CreateTextFileOptions = {
  directoryPaths: process.env.DIRECTORY_PATHS?.split(',') || [],
  extensions: process.env.EXTENSIONS?.split(',') || [],
  depth: process.env.DEPTH ? parseInt(process.env.DEPTH, 10) : undefined,
};

// Проверяем, что переданы необходимые параметры
if (!options.directoryPaths.length || !options.extensions.length) {
  console.error('Please provide directory paths and file extensions as environment variables.');
  process.exit(1);
}

// Вызываем функцию createTextFile с объектом параметров
createTextFile(options);
