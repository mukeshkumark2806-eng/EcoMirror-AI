import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  test: {
    // Vitest configuration
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/test/**',
        'src/data/**',
        'src/main.jsx',
        '**/*.css',
        'src/pages/**',
        'src/components/**',
        'src/App.jsx',
        'src/context/LanguageContext.jsx',
        'src/context/ToastContext.jsx',
        'src/hooks/useMediaQuery.js',
      ],
    },
  },
});
