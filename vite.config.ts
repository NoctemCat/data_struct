import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import postcssNested from 'postcss-nested';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/**'),
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { rollupOptions: { input: { app: './index.html' } } },
  css: {
    postcss: {
      plugins: [
        postcssNested({}),
        autoprefixer({}), // add options if needed
      ],
    },
  },
});
