import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './vitest.config.e2e.mts',
  './vitest.config.mts',
  './dist/vitest.config.mjs',
  // './dist/vitest.config.e2e.mjs',
]);
