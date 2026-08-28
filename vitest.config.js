const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    bail: 1,
    include: ['src.tests/**/*.spec.{ts,tsx}', 'src/Plugins/**/*.spec.ts'],
    setupFiles: ['./src.tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['./src/**/*.ts'],
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
    },
  },
});
