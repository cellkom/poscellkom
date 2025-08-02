import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc"; // Pastikan ini diimpor dengan benar
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()], // Pastikan plugin react() ada di sini
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));