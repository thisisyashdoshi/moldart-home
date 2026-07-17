import js from '@eslint/js';

const globals = {
  AbortController: 'readonly',
  Buffer: 'readonly',
  FormData: 'readonly',
  Headers: 'readonly',
  IntersectionObserver: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  __dirname: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  crypto: 'readonly',
  document: 'readonly',
  exports: 'readonly',
  fetch: 'readonly',
  getComputedStyle: 'readonly',
  globalThis: 'readonly',
  localStorage: 'readonly',
  module: 'readonly',
  navigator: 'readonly',
  performance: 'readonly',
  process: 'readonly',
  require: 'readonly',
  requestAnimationFrame: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  window: 'readonly',
};

export default [
  {
    ignores: [
      '.tmp/**',
      'downloads/**',
      'images/**',
      'node_modules/**',
      'pagefind/**',
      'public-site/**',
      'trade-portal/**',
      '**/*-YASH-LAPTOP.*',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals,
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-useless-escape': 'warn',
    },
  },
];
