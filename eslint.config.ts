import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

/**
 * The architecture is enforced here, not just documented.
 *
 * Two mechanisms:
 *  1. `import/no-restricted-paths` — coarse, module-level boundaries
 *     (core/shared/features/app may only depend "inward").
 *  2. `no-restricted-imports` per-layer overrides — fine-grained DDD purity
 *     (domain stays framework-free, application never sees infrastructure, etc.).
 *
 * Type-checked rules run at the strictest tier (`strictTypeChecked`) so the linter reasons about
 * real types, the way a C# compiler would — not just syntax.
 *
 * If a rule fights you, the import is almost always the smell — not the rule.
 */
export default defineConfig([
  {
    ignores: ['dist', 'coverage', 'node_modules', 'node_modules/.tmp', 'scripts'],
  },

  // Base + strict, type-aware TypeScript rules for all source files.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.e2e.json'],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // --- Code-smell guard rails (these block "bad code" at lint time) ---
      complexity: ['error', { max: 12 }],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['error', 4],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-alert': 'error',
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'no-param-reassign': ['error', { props: true }],
      'prefer-const': 'error',
      'no-var': 'error',

      // --- Explicit typing & OOP discipline (C#-style: nothing implicit) ---
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        { accessibility: 'explicit' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // --- Module-level architecture boundaries (dependencies point inward) ---
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // core is the foundation: it must not know about anything above it.
            { target: './src/core', from: './src/app' },
            { target: './src/core', from: './src/features' },
            { target: './src/core', from: './src/shared' },
            // The shared domain kernel stays pure: value objects never reach for the transport layer.
            { target: './src/core/domain', from: './src/core/http' },
            // shared is generic: no feature or app knowledge.
            { target: './src/shared', from: './src/app' },
            { target: './src/shared', from: './src/features' },
            // features must not depend on the composition root.
            { target: './src/features', from: './src/app' },
          ],
        },
      ],
      'import/no-cycle': ['error', { maxDepth: Infinity }],
      'import/no-self-import': 'error',
      'import/no-useless-path-segments': 'error',
    },
  },

  // DDD purity — the domain is the heart and stays free of frameworks & lower layers.
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'react-router-dom',
                'zustand',
                'zustand/*',
                '@core/http',
                '@core/http/*',
                '**/application/**',
                '**/infrastructure/**',
                '**/presentation/**',
                '**/store/**',
              ],
              message:
                'Domain must stay pure: no React, no Zustand, no HTTP, and no dependency on application/infrastructure/presentation/store layers.',
            },
          ],
        },
      ],
    },
  },

  // Application orchestrates the domain; it never reaches into infrastructure or UI.
  {
    files: ['src/features/*/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-dom',
                'react-router-dom',
                'zustand',
                'zustand/*',
                '**/infrastructure/**',
                '**/presentation/**',
                '**/store/**',
              ],
              message:
                'Application layer must depend on domain abstractions only — not on infrastructure, presentation, store, or React.',
            },
          ],
        },
      ],
    },
  },

  // Infrastructure implements domain ports; it must not depend on the UI.
  {
    files: ['src/features/*/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', '**/presentation/**', '**/store/**'],
              message:
                'Infrastructure may depend on domain/application/core only — never on presentation or store.',
            },
          ],
        },
      ],
    },
  },

  // The logger is the single sanctioned wrapper around `console`.
  {
    files: ['src/core/logger/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Config & build files run in Node.
  {
    files: ['*.{js,ts}', 'vite.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Playwright end-to-end tests run in Node and may use the test-runner's freedoms.
  {
    files: ['e2e/**/*.{ts,tsx}', 'playwright.config.ts'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'max-lines-per-function': 'off',
    },
  },

  // Tests get a little more freedom (non-null assertions, longer files).
  {
    files: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/testing/**/*.{ts,tsx}',
      'vitest.setup.ts',
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-lines-per-function': 'off',
      'max-lines': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
]);
