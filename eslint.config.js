const { FlatCompat } = require('@eslint/eslintrc');
const prettierPlugin = require('eslint-plugin-prettier');
const securityPlugin = require('eslint-plugin-security');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

const compat = new FlatCompat();

module.exports = [
  {
    files: ['src/**/*.[jt]s', 'src/**/*.[jt]sx'],
    languageOptions: {
      ecmaVersion: 2019,
      parser: tsParser,
      sourceType: 'module',
      globals: {
        __non_webpack_require__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
      security: securityPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'prettier/prettier': 'error',
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    ignores: ['/node_modules/**/*', '*.html', '**/dist/**/*', '**/.history/**/*'],
  },
  ...compat.extends('airbnb-base'),
  {
    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'], // Добавляем поддержку для .ts и .tsx
          moduleDirectory: ['node_modules', 'src/'],
        },
      },
    },
  },
  {
    rules: {
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'no-await-in-loop': 'off',
      'operator-linebreak': ['off', 'after'], // конфликт с prettier
      'no-console': 'off',
      'max-classes-per-file': 'off',
      'no-use-before-define': 'off',
      'import/prefer-default-export': 'off',

      'max-len': [
        'error',
        {
          code: 120,
          comments: 200,
          ignoreUrls: true,
          ignorePattern: '^import .*',
          ignoreTrailingComments: true,
          ignoreTemplateLiterals: true,
          ignoreStrings: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import/extensions': ['error', 'ignorePackages', { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' }],
      'object-curly-newline': ['error', { consistent: true }],

      'no-shadow': 'off',
      'no-unused-vars': 'off',

      'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        },
      ],

      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['acc'],
        },
      ],

      'no-underscore-dangle': ['error', { allowAfterThis: true }],
    },
  },
];
