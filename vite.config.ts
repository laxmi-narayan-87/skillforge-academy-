import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  base: process.env.VERCEL ? "/" : "/skillforge-academy-/",
  server: {
    host: process.env.HOST || "127.0.0.1", // Opt in to remote access with HOST=0.0.0.0
    port: 8080,
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
    host: process.env.HOST || "127.0.0.1",
  }
}));