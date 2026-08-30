/**
 * @dsh-external/dsh-right-sidebar Node half.
 *
 * Browser-only UI plugin (ui-panel form): the host half is a no-op; the whole
 * product lives in ./client (see src/client/index.ts and PROPOSAL.md).
 */
import type { Context } from '@deepseek-ai/cordis'

export const name = '@dsh-external/dsh-right-sidebar'
export const inject: string[] = []

export function apply(_ctx: Context): void {}
