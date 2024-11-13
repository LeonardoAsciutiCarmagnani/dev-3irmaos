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
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist", // Adicione esta linha para garantir que a build seja colocada no diretório correto
    rollupOptions: {
      input: "./index.html", // Certifique-se de que o caminho para o arquivo de entrada HTML está correto
    },
  },
});
