import typescript from '@rollup/plugin-typescript';

export default {
    input: 'index.ts',
    output: {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        entryFileNames: '[hash].js'
    },
    plugins: [typescript()]
};