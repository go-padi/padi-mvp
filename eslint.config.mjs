import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly',
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];
