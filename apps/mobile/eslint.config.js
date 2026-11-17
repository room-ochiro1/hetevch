// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Project rule: no source file may exceed 160 lines (see /CLAUDE.md).
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'max-lines': ['error', { max: 160, skipBlankLines: false, skipComments: false }],
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts'],
  },
]);
