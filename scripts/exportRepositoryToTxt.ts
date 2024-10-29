import * as fs from 'fs';
import * as path from 'path';

const directoryPaths = ['./tests'];
const outputPath = './output/output.txt'; // Путь для сохранения результирующего

export const walkSync = (
  dir: string,
  options: { ignoreFolders: string[]; extensions?: string[]; ignoreFiles: string[] } = {
    ignoreFolders: [],
    ignoreFiles: [],
  },
): string[] => {
  const baseDir = path.basename(dir);
  if (!fs.existsSync(dir) || options.ignoreFolders.includes(baseDir)) {
    return [];
  }
  if (!fs.statSync(dir).isDirectory()) {
    return [dir];
  }
  const dirs = fs
    .readdirSync(dir)
    .map((f) => walkSync(path.join(dir, f), options))
    .flat()
    .filter((v) => !options.ignoreFiles.includes(v))
    .filter((v) => (options.extensions ? options.extensions.includes(path.parse(v).ext) : true));
  return dirs;
};

function createTextFile() {
  const filePaths = [
    ...directoryPaths.map((v) => walkSync(v, { extensions: ['.yaml'], ignoreFolders: [], ignoreFiles: [] })).flat(),
  ];
  let fileContents = '';

  for (const filePath of filePaths) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    fileContents += `File: ${filePath}\n\n${fileContent}\n\n`;
  }

  fs.writeFileSync(outputPath, fileContents);
  console.log(`Text file created: ${outputPath}`);
}

createTextFile();
