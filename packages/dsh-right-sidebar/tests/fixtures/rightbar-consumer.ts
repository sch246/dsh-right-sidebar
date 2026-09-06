import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {
  RightbarViewOwnerProps,
  RightSidebarSessionId,
} from '@dsh-external/dsh-right-sidebar/client'

export interface RightbarConsumerEvent {
  readonly kind: 'attach' | 'detach' | 'launch'
  readonly selection?: unknown
}

export const editor = ({ instanceId }: RightbarViewOwnerProps): string => instanceId
export const preview = ({ instanceId }: RightbarViewOwnerProps): string => instanceId

/** External feature fixture that uses only the public workbench API and view seat. */
export function rightbarConsumer(events: RightbarConsumerEvent[]) {
  return {
    inject: ['slots', 'rightSidebar'],
    apply(ctx: ClientContext): void {
      ctx.slots.inject('rightbar.view', () => {
        events.push({ kind: 'attach' })
        const disposeViews = [
          ctx.slots.register({ name: 'rightbar.view', id: 'editor' }, editor),
          ctx.slots.register({ name: 'rightbar.view', id: 'preview' }, preview),
        ]
        const disposeLauncher = ctx.rightSidebar.registerLauncher({
          id: 'editor',
          label: 'Editor',
          open: (sessionId: RightSidebarSessionId, selection?: unknown) => {
            events.push({ kind: 'launch', selection })
            ctx.rightSidebar.openInstance(sessionId, {
              id: `editor:${String(selection)}`,
              viewId: 'editor',
              title: `Editor ${String(selection)}`,
            })
          },
        })
        const disposeRestorer = ctx.rightSidebar.registerRestorer('editor', () => {})
        return () => {
          disposeRestorer()
          disposeLauncher()
          for (const dispose of disposeViews.reverse()) dispose()
          events.push({ kind: 'detach' })
        }
      })
    },
  }
}
