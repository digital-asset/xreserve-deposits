import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // Suppress noisy warnings emitted by Rollup for "use client" markers
      onwarn(warning, defaultHandler) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          /Module level directives cause errors when bundled/.test(warning.message)
        ) {
          return; // ignore "use client" and similar module-level directive warnings
        }
        defaultHandler(warning);
      },
    },
  },
});
