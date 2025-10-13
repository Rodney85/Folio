// vite.config.ts
import { defineConfig } from "file:///B:/Software/Personal/Carfolio/Folio-App/node_modules/vite/dist/node/index.js";
import react from "file:///B:/Software/Personal/Carfolio/Folio-App/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///B:/Software/Personal/Carfolio/Folio-App/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "B:\\Software\\Personal\\Carfolio\\Folio-App";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-select"],
          icons: ["lucide-react"],
          utils: ["clsx", "class-variance-authority", "tailwind-merge"],
          // Feature chunks
          auth: ["@clerk/clerk-react"],
          convex: ["convex"],
          analytics: ["react-ga4"],
          // Admin chunk
          admin: [
            "./src/pages/admin/AdminDashboardPage.tsx",
            "./src/pages/admin/AdminOverviewPage.tsx",
            "./src/pages/admin/AdminUsersPage.tsx",
            "./src/pages/admin/AdminContentPage.tsx",
            "./src/pages/admin/AdminOperationsPage.tsx"
          ],
          // Analytics page chunks
          analyticsPages: [
            "./src/pages/AnalyticsPage.tsx",
            "./src/pages/ProAnalyticsPage.tsx",
            "./src/pages/CarInsightsPage.tsx"
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1e3,
    // Enable source maps for debugging
    sourcemap: mode === "development"
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "lucide-react",
      "clsx",
      "class-variance-authority",
      "tailwind-merge"
    ]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJCOlxcXFxTb2Z0d2FyZVxcXFxQZXJzb25hbFxcXFxDYXJmb2xpb1xcXFxGb2xpby1BcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkI6XFxcXFNvZnR3YXJlXFxcXFBlcnNvbmFsXFxcXENhcmZvbGlvXFxcXEZvbGlvLUFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQjovU29mdHdhcmUvUGVyc29uYWwvQ2FyZm9saW8vRm9saW8tQXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFZlbmRvciBjaHVua3NcclxuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgIHJvdXRlcjogWydyZWFjdC1yb3V0ZXItZG9tJ10sXHJcbiAgICAgICAgICB1aTogWydAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJywgJ0ByYWRpeC11aS9yZWFjdC1kcm9wZG93bi1tZW51JywgJ0ByYWRpeC11aS9yZWFjdC1zZWxlY3QnXSxcclxuICAgICAgICAgIGljb25zOiBbJ2x1Y2lkZS1yZWFjdCddLFxyXG4gICAgICAgICAgdXRpbHM6IFsnY2xzeCcsICdjbGFzcy12YXJpYW5jZS1hdXRob3JpdHknLCAndGFpbHdpbmQtbWVyZ2UnXSxcclxuICAgICAgICAgIC8vIEZlYXR1cmUgY2h1bmtzXHJcbiAgICAgICAgICBhdXRoOiBbJ0BjbGVyay9jbGVyay1yZWFjdCddLFxyXG4gICAgICAgICAgY29udmV4OiBbJ2NvbnZleCddLFxyXG4gICAgICAgICAgYW5hbHl0aWNzOiBbJ3JlYWN0LWdhNCddLFxyXG4gICAgICAgICAgLy8gQWRtaW4gY2h1bmtcclxuICAgICAgICAgIGFkbWluOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9BZG1pbkRhc2hib2FyZFBhZ2UudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL2FkbWluL0FkbWluT3ZlcnZpZXdQYWdlLnRzeCcsXHJcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9hZG1pbi9BZG1pblVzZXJzUGFnZS50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvYWRtaW4vQWRtaW5Db250ZW50UGFnZS50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvYWRtaW4vQWRtaW5PcGVyYXRpb25zUGFnZS50c3gnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgIC8vIEFuYWx5dGljcyBwYWdlIGNodW5rc1xyXG4gICAgICAgICAgYW5hbHl0aWNzUGFnZXM6IFtcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL0FuYWx5dGljc1BhZ2UudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL1Byb0FuYWx5dGljc1BhZ2UudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL0Nhckluc2lnaHRzUGFnZS50c3gnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIE9wdGltaXplIGNodW5rIHNpemVcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIC8vIEVuYWJsZSBzb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nXHJcbiAgICBzb3VyY2VtYXA6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcsXHJcbiAgfSxcclxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3JlYWN0JyxcclxuICAgICAgJ3JlYWN0LWRvbScsXHJcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgJ2x1Y2lkZS1yZWFjdCcsXHJcbiAgICAgICdjbHN4JyxcclxuICAgICAgJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eScsXHJcbiAgICAgICd0YWlsd2luZC1tZXJnZScsXHJcbiAgICBdLFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVCxTQUFTLG9CQUFvQjtBQUM5VSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxVQUM3QixRQUFRLENBQUMsa0JBQWtCO0FBQUEsVUFDM0IsSUFBSSxDQUFDLDBCQUEwQixpQ0FBaUMsd0JBQXdCO0FBQUEsVUFDeEYsT0FBTyxDQUFDLGNBQWM7QUFBQSxVQUN0QixPQUFPLENBQUMsUUFBUSw0QkFBNEIsZ0JBQWdCO0FBQUE7QUFBQSxVQUU1RCxNQUFNLENBQUMsb0JBQW9CO0FBQUEsVUFDM0IsUUFBUSxDQUFDLFFBQVE7QUFBQSxVQUNqQixXQUFXLENBQUMsV0FBVztBQUFBO0FBQUEsVUFFdkIsT0FBTztBQUFBLFlBQ0w7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBO0FBQUEsVUFFQSxnQkFBZ0I7QUFBQSxZQUNkO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLHVCQUF1QjtBQUFBO0FBQUEsSUFFdkIsV0FBVyxTQUFTO0FBQUEsRUFDdEI7QUFBQTtBQUFBLEVBRUEsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
