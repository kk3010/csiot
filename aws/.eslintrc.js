module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'standard', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-useless-constructor': 'off',
    semi: 'warn',
    'tsdoc/syntax': 'warn',
  },
}
