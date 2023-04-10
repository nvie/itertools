import { cp } from 'fs/promises';
import { resolve } from 'path';
import { defineConfig } from 'tsup';

const outDir = resolve(__dirname, 'dist');

export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    splitting: true,
    clean: true,
    target: 'es2015',
    format: ['cjs', 'esm'],

    // Perhaps enable later?
    minify: true,
    sourcemap: true,

    async onSuccess() {
        await cp(
            // Until tsup supports this out of the box, copy the definitions
            // manually, see https://github.com/egoist/tsup/issues/760
            resolve(outDir, 'index.d.ts'),
            resolve(outDir, 'index.d.mts')
        );
    },
});
