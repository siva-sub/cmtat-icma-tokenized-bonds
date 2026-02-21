import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig(({ mode }) => ({
    plugins: [
        TanStackRouterVite(),
        react()
    ],
    base: mode === 'production' ? '/cmtat-icma-tokenized-bonds/' : '/',
    define: {
        'global': 'globalThis',
        'process.env': '{}',
        'process.browser': 'true',
        'process.version': '"v20.0.0"',
    },
    resolve: {
        alias: {
            buffer: 'buffer/',
            util: 'util/',
        },
    },
}))
