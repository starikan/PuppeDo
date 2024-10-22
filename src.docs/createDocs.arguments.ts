import * as ts from 'typescript';
import { argsDefault } from '../src/Defaults';

export function generateDocumentationArguments(): string {
  const program = ts.createProgram(['./src/global.d.ts'], {});
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile('./src/global.d.ts');

  if (!sourceFile) {
    throw new Error('Не удалось найти файл ./src/global.d.ts');
  }

  let interfaceDeclaration: ts.InterfaceDeclaration | undefined;

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'ArgumentsType') {
      interfaceDeclaration = node;
    }
  });

  if (!interfaceDeclaration) {
    throw new Error('Не удалось найти интерфейс ArgumentsType');
  }

  let documentation = '# Аргументы запуска\n\n';
  documentation += 'Параметр | Описание | Значение по умолчанию | Тип\n';
  documentation += '--- | --- | --- | ---\n';

  interfaceDeclaration.members.forEach((member) => {
    if (ts.isPropertySignature(member) && member.name) {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      const propertyName = member.name.escapedText as string;
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      const description = member.jsDoc?.[0]?.comment || 'Описание отсутствует';
      const defaultValue =
        propertyName === 'PPD_ROOT'
          ? 'process.cwd()'
          : JSON.stringify(argsDefault[propertyName as keyof typeof argsDefault]);
      // const type = member.type ? ts.SyntaxKind[member.type.kind] : 'unknown';
      const type = member.type ? checker.typeToString(checker.getTypeFromTypeNode(member.type)) : 'unknown';

      documentation += `${propertyName} | ${description} | \`${defaultValue}\` | \`${type}\`\n`;
    }
  });

  return documentation;
}
