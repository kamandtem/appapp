import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // relative base so the bundle also works inside the Android WebView
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2019',
    assetsInlineLimit: 0,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
