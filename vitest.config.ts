import { defineConfig } from 'vitest/config'
import path from 'node:path'

const checkout = process.env.DSH_CHECKOUT ?? '/root/deepseek-harness'

export default defineConfig({
  resolve: {
    alias: {
      '@deepseek-ai/cordis': path.join(checkout, 'vendor/cordis/src/index.ts'),
      '@deepseek-ai/dsh-client-store': path.join(checkout, 'packages/client/store/src/index.ts'),
      '@deepseek-ai/dsh-client-ui-renderer/client': path.join(checkout, 'packages/client/ui-renderer/src/client/index.ts'),
      '@deepseek-ai/dsh-client-locale/client': path.join(checkout, 'packages/client/locale/src/client/index.ts'),
      '@deepseek-ai/dsh-client-ui-slots': path.join(checkout, 'packages/client/ui-slots/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
})
