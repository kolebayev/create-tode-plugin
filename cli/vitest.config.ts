import { defineConfig } from 'vitest/config';

// Only the generator's own tests; template projects carry their own.
export default defineConfig({ test: { include: ['src/**/*.test.ts'] } });
