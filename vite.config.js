import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    let env = loadEnv(mode, process.cwd()),
        server = {};

        try {
            let o = JSON.parse(env.VITE_PROXY || '{}'),
                proxy = {};
            (o.proxy || []).map(i => {
                proxy[i.src] = i.target;
            });
            server = {
                host: '0.0.0.0',
                port: o.port || '',
                proxy: {...proxy},
            };
        }catch(e){}

    return ({
        base: env.VITE_BASEDIR || '/',
        plugins: [
            react(),
            svgr(),
        ],
        server: {...server},
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
            }
        },
        define: {
            BASEDIR: JSON.stringify(env.VITE_BASEDIR),
            DEBUG: JSON.stringify(env.VITE_DEBUG),
        },
    });
});
