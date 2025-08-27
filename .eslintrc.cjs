module.exports = {
  root: true,
  ignorePatterns: ['dist', '.next', 'coverage'],
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
};
