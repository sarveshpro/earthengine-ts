import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@google/earthengine'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  },
});

