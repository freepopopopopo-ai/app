import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    async configureServer(server) {
      try {
        const express = (await import('express')).default;
        const { apiRouter } = await import('./src/backend/apiRoutes.js');
        const app = express();
        app.use(express.json());
        app.use('/api', apiRouter);
        server.middlewares.use(app);
      } catch (e) {
        console.warn('API middleware skipped in standalone build mode');
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
