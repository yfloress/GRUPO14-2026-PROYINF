import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Needed for Docker to expose the port outside the container
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true, // Needed for hot reload in Docker on Windows/Mac
    }
  },
});
