import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
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
          analytics: ['react-ga4'],
          // Admin chunk
          admin: [
            './src/pages/admin/AdminDashboardPage.tsx',
            './src/pages/admin/AdminOverviewPage.tsx',
            './src/pages/admin/AdminUsersPage.tsx',
            './src/pages/admin/AdminContentPage.tsx',
            './src/pages/admin/AdminOperationsPage.tsx',
          ],
          // Analytics chunks
          analytics: [
            './src/pages/AnalyticsPage.tsx',
            './src/pages/ProAnalyticsPage.tsx',
            './src/pages/CarInsightsPage.tsx',
          ],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: mode === 'development',
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
}));
