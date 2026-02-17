import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // By default, only env variables prefixed with `VITE_` are loaded
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
            icons: ['lucide-react'],
            utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
            // Feature chunks
            auth: ['@clerk/clerk-react'],
            convex: ['convex'],
            // Analytics page chunks
            analyticsPages: [
              './src/pages/AnalyticsPage.tsx',
              './src/pages/ProAnalyticsPage.tsx',
            ],
          },
        },
      },
      // Optimize chunk size
      chunkSizeWarningLimit: 1000,
      // Enable source maps for debugging
      sourcemap: mode === 'development',
      // Target es2015 for react-snap compatibility
      target: 'es2015',
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'clsx',
        'class-variance-authority',
        'tailwind-merge',
      ],
    },
    define: {
      // Make env variables available to the app
      'import.meta.env.MODE': JSON.stringify(mode),
    },
  }
});
