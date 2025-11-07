import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 5173,
        strictPort: false,
        // Garantir que todas as rotas sejam servidas corretamente
        historyApiFallback: true,
    },
    plugins: [
        react(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));
