import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const port = Number(env.VITE_PORT);
  const apiTarget = `${env.API_URL}:${env.PORT}`;
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss(),
],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port,
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
        },
        '/socket.io/': {
          target: apiTarget,
          changeOrigin: true,
          secure: isProd,
          ws: true,
        },
      },
    },
  };
});
