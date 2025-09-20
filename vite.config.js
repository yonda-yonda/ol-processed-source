import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: ".",
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  build: {
    rollupOptions: {
      input: "src/pages/index.html",
    },
    outDir: "public",
    sourcemap: true,
  },
});
