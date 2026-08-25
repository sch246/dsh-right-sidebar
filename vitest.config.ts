import { defineConfig } from 'vitest/config'
import path from 'node:path'

const checkout = process.env.DSH_CHECKOUT ?? '/root/deepseek-harness'
const standardCheckout = process.env.DSH_STD_CHECKOUT ?? '/root/dsh-std'

export default defineConfig({
  resolve: {
    alias: {
      '@deepseek-ai/dsh-client-runtime/client': path.join(checkout, 'packages/client/runtime/src/client/index.ts'),
      '@deepseek-ai/dsh-client-locale/client': path.join(checkout, 'packages/client/locale/src/client/index.ts'),
      '@deepseek-ai/dsh-client-ui-slots': path.join(checkout, 'packages/client/ui-slots/src/index.ts'),
      '@dsh-std/adapter-dsh/client': path.join(standardCheckout, 'packages/adapter-dsh/src/client.ts'),
      '@dsh-std/core': path.join(standardCheckout, 'packages/core/src/index.ts'),
      '@dsh-std/manifest': path.join(standardCheckout, 'packages/manifest/src/index.ts'),
      '@dsh-std/sdk': path.join(standardCheckout, 'packages/sdk/src/index.ts'),
      '@dsh-std/ui': path.join(standardCheckout, 'packages/ui/src/index.ts'),
      '@dsh-std/ui-browser': path.join(standardCheckout, 'packages/ui-browser/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.{ts,tsx}'],
  },
})
