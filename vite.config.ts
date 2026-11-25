/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const resolvePath = (relativePath: string): string =>
  fileURLToPath(new URL(relativePath, import.meta.url));

function getManualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined;
  }
  if (id.includes('@tanstack')) {
    return 'query';
  }
  if (id.includes('@radix-ui')) {
    return 'radix';
  }
  if (id.includes('@sentry')) {
    return 'sentry';
  }
  if (id.includes('node_modules/motion')) {
    return 'motion';
  }
  if (id.includes('node_modules/recharts')) {
    return 'charts';
  }
  if (
    /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)
  ) {
    return 'react';
  }
  return undefined;
}

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@app': resolvePath('./src/app'),
        '@core': resolvePath('./src/core'),
        '@shared': resolvePath('./src/shared'),
        '@features': resolvePath('./src/features'),
        '@testing': resolvePath('./src/testing'),
      },
    },
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: getManualChunks,
        },
      },
    },
    test: {
      globals: false,
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      testTimeout: 15_000,
      hookTimeout: 15_000,
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.{test,spec}.{ts,tsx}',
          'src/**/index.ts',
          'src/testing/**',
          'src/main.tsx',
          'src/**/*.d.ts',
        ],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  };
});
