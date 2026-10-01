import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = process.cwd();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(root, "src")
    }
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, "index.html"),
        people: resolve(root, "people/index.html"),
        admin: resolve(root, "admin/index.html")
      }
    }
  }
});
