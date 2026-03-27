import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      outDir: 'dist/types',
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bridge: resolve(__dirname, 'src/bridge/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        entryName === 'bridge'
          ? `guide-pilot.bridge.${format === 'es' ? 'es' : 'cjs'}.js`
          : `guide-pilot.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
        assetFileNames: (assetInfo) =>
          assetInfo.name === 'style.css' ? 'guide-pilot.css' : (assetInfo.name ?? 'asset'),
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
