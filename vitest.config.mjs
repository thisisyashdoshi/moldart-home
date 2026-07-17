export default {
  test: {
    include: ['tests/**/*.test.mjs'],
    exclude: ['node_modules/**', 'public-site/**', 'trade-portal/**', '.tmp/**'],
    environment: 'node',
  },
};
