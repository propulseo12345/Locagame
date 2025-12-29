import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Optimisation du bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendor chunks pour un meilleur caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // Augmenter la limite d'avertissement de taille de chunk
    chunkSizeWarningLimit: 1000,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true,
      },
    },
    // Source maps pour le debug en production (optionnel)
    sourcemap: false,
  },
  // Optimisations pour le dev
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
  // Préchargement des dépendances
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
