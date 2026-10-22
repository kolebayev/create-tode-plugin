import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/main/**/*.test.ts'],
    setupFiles: ['src/test/figma-stub.ts'],
    environment: 'node',
  },
});
