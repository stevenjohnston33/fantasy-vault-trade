import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  define: {
    global: 'globalThis',  // Critical for FHE SDK compatibility
    'process.env': {} // Prevent ethereum injection conflicts
  },
  optimizeDeps: {
    include: ['@zama-fhe/relayer-sdk/bundle'],  // Pre-build FHE SDK
    exclude: ['@rainbow-me/rainbowkit']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Prevent ethereum conflicts during build
        if (id.includes('ethereum') || id.includes('window.ethereum')) {
          return false;
        }
        return false;
      }
    }
  }
}));
