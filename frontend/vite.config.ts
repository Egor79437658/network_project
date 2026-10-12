import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wails from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: Number(process.env.WAILS_VITE_PORT) || 9245,
    strictPort: true,
  },
  plugins: [react(), wails("./bindings"), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@customComponents": path.resolve(
        import.meta.dirname,
        "./src/components/custom",
      ),
      "@shadcnComponents": path.resolve(
        import.meta.dirname,
        "./src/components/ui",
      ),
      "@bindings": path.resolve(
        import.meta.dirname,
        "./bindings",
      ),
    },
  },
});
