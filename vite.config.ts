import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Optimize chunk size
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks
            'react-vendor': ['react', 'react-dom'],
            'motion-vendor': ['motion'],
            'lucide-vendor': ['lucide-react'],
          },
        },
      },
      // Minify
      minify: 'esbuild',
      // CSS code splitting
      cssCodeSplit: true,
      // Source maps for debugging
      sourcemap: false,
    },
    // Performance optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion', 'lucide-react'],
    },
  };
});
