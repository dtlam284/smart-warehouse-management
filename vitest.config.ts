import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/tests/setup.ts',
        globals: true,
        coverage: {
            provider: 'v8',
            include: [
                'src/store/slices/**/*.{ts,tsx}',
                'src/store/selectors/**/*.{ts,tsx}',
                'src/validations/**/*.{ts,tsx}',
                'src/models/common/**/*.{ts,tsx}',
            ],
            exclude: [
                'src/**/*.d.ts',
                'src/tests/**',
                'src/main.tsx',
                'src/App.tsx',
            ],
        },
    },
})
