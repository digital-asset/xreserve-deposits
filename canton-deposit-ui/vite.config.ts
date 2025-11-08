import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/xreserve-deposits/',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Suppress noisy warnings emitted by Rollup for "use client" markers
      onwarn(warning, defaultHandler) {
        if (
          warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
          /Module level directives cause errors when bundled/.test(warning.message)
        ) {
          return; // ignore "use client" and similar module-level directive warnings
        }
        // Suppress /*#__PURE__*/ comment warnings from third-party libraries
        if (
          warning.code === 'SOURCEMAP_ERROR' ||
          (warning.code === 'INVALID_ANNOTATION' && warning.message?.includes('PURE'))
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
});
