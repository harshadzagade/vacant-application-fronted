import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5177,
    allowedHosts: ['admission.met.edu'], // ✅ Add this line
    proxy: {
      '/api': {
        target: 'https://admission.met.edu/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
