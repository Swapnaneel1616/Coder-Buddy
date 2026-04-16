import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    // Set the JavaScript target for the final bundle.
    // Adjust as needed for your supported browsers.
    target: 'es2015',
    // Optional: customize output directory if desired.
    outDir: 'dist',
    // Ensure source maps are generated for easier debugging.
    sourcemap: true
  }
});