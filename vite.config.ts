import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // This is more explicit than true
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [
    react({
      plugins: [["@swc/plugin-emotion", {}]],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));