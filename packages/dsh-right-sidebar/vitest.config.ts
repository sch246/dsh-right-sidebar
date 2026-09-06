import { defineConfig } from 'vitest/config'
import path from 'node:path'

const checkout = process.env.DSH_CHECKOUT
if (!checkout) throw new Error('Set DSH_CHECKOUT to the selected Harness checkout')

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@deepseek-ai/cordis': path.join(checkout, 'vendor/cordis/src/index.ts'),
      '@deepseek-ai/dsh-client-ui-renderer/client': path.join(checkout, 'packages/client/ui-renderer/src/client/index.ts'),
      '@deepseek-ai/dsh-client-locale/client': path.join(checkout, 'packages/client/locale/src/client/index.ts'),
      '@deepseek-ai/dsh-client-ui-slots': path.join(checkout, 'packages/client/ui-slots/src/index.ts'),
      '@deepseek-ai/dsh-client-ui-primitives': path.join(checkout, 'packages/client/ui-primitives/src/index.ts'),
      '@deepseek-ai/dsh-client-store': path.join(checkout, 'packages/client/store/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
})
