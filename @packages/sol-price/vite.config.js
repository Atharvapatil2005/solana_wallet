import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'cjs.js'}`,
    },
    rollupOptions: {
      external: ['node-fetch'],
      output: {
        globals: {
          'node-fetch': 'fetch',
        },
      },
    },
  },
});
