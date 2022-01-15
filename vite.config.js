import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import commonjsExternals from "vite-plugin-commonjs-externals";

export default defineConfig({
    plugins: [
        vue(),
        commonjsExternals({
            externals: ["path"],
        }),
    ],
    define: {
        "process.env": process.env,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    server: {
        open: true,
    },
});
