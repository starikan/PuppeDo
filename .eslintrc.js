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

    'prettier/prettier': 'error',
    'max-len': ['error', { code: 120 }],
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
  },
};
