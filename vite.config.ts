import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  mode: "production",
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: "./index.html",
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          html2canvas: ["html2canvas"],
          jspdf: ["jspdf"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      output: {
        comments: false,
      },
    },
  },
});
