import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { transformSync } from 'esbuild';

const jsAsJsxPlugin = () => ({
  name: 'treat-js-files-as-jsx',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('.js') || id.includes('node_modules') || id.startsWith('\0')) {
      return null;
    }
    const result = transformSync(code, { loader: 'jsx', jsx: 'automatic', sourcemap: false });
    return { code: result.code };
  },
});

export default defineConfig({
  plugins: [jsAsJsxPlugin(), react()],
  server: {
    port: 5173,
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    jsx: 'automatic',
  },
});
