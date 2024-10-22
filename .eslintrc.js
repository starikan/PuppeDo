module.exports = {
  env: {
    // browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2019 },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'security'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-await-in-loop': 'off',
    'operator-linebreak': ['off', 'after'], // prettier conflict
    'no-console': 'off',
    'max-classes-per-file': 'off',
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off',

    'prettier/prettier': 'error',
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
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
    '@typescript-eslint/explicit-function-return-type': 'error',

    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',

    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',

    'security/detect-object-injection': 'off',
    'security/detect-non-literal-fs-filename': 'off',

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
};
