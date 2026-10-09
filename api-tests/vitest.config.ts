import { defineConfig } from 'vitest/config';

const deployedBaseUrl = process.env.VITE_TEST_BASE_URL ?? process.env.BASE_URL ?? '';

export default defineConfig({
  define: {
    'process.env.BASE_URL': JSON.stringify(deployedBaseUrl),
    'process.env.VITE_TEST_BASE_URL': JSON.stringify(deployedBaseUrl),
  },
  test: {
    environment: 'node',
    include: ['api-tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    env: {
      VITE_TEST_BASE_URL: deployedBaseUrl,
    },
  },
});
