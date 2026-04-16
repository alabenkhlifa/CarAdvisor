import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 5274,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://api:3100',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
