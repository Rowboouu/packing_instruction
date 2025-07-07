import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  const port = Number(env.VITE_PORT) || 5138; // Default fallback
  const apiTarget = `${env.API_URL}:${env.PORT}`;
  const isProd = mode === 'production';

  console.log('🔧 Vite Config:');
  console.log(`  Frontend Port: ${port}`);
  console.log(`  API Target: ${apiTarget}`);
  console.log(`  Mode: ${mode}`);

  return {
    plugins: [react(), tailwindcss()],
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
          changeOrigin: true,
          secure: isProd,
          // Add some debugging
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ API Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 API Proxying request:', req.method, req.url, '→', apiTarget + req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ API Proxy response:', req.method, req.url, '→', proxyRes.statusCode);
            });
          },
        },
        '/webhook': {  // Add this webhook proxy
          target: apiTarget,
          changeOrigin: true,
          secure: isProd,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('❌ Webhook Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔄 Webhook Proxying request:', req.method, req.url, '→', apiTarget + req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ Webhook Proxy response:', req.method, req.url, '→', proxyRes.statusCode);
            });
          },
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