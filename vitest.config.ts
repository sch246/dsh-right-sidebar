import { defineConfig } from 'vitest/config'
import path from 'node:path'

const checkout = process.env.DSH_CHECKOUT ?? '/root/deepseek-harness'

export default defineConfig({
  resolve: {
    alias: {
      '@deepseek-ai/dsh-client-runtime/client': path.join(checkout, 'packages/client/runtime/src/client/index.ts'),
      '@deepseek-ai/dsh-client-locale/client': path.join(checkout, 'packages/client/locale/src/client/index.ts'),
      '@deepseek-ai/dsh-client-ui-slots': path.join(checkout, 'packages/client/ui-slots/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
})
