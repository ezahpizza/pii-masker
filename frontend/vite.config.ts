
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig(({ mode }) => {
  // Load env vars
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.VITE_BACKEND_URL || "http://localhost:8000";
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/files": backendUrl,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});