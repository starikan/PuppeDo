module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    describe: true,
    test: true,
    expect: true,
    jest: true,
    beforeAll: true,
    beforeEach: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src/'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2018 },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'operator-linebreak': [0, 'after'],
    'space-before-function-paren': [0],
    'object-curly-newline': ['error', { consistent: true }],
    'max-len': ['error', { code: 120 }],
    'prettier/prettier': 'warn',
    'import/extensions': 0,
    'lines-between-class-members': 0,
  },
};
