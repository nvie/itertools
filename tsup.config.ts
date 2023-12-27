import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    splitting: true,
    clean: true,
    format: ['cjs', 'esm'],
    minify: false,
    sourcemap: true,
});
