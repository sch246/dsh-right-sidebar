import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@dsh-external/dsh-right-sidebar/client'

export interface RightbarConsumerEvent {
  readonly kind: 'attach' | 'detach'
}

export const outline = (): null => null
export const history = (): null => null

/** External feature fixture that depends only on the public rightbar registration contract. */
export function rightbarConsumer(events: RightbarConsumerEvent[]) {
  return {
    inject: ['slots'],
    apply(ctx: ClientContext): void {
      ctx.slots.inject('rightbar.tab', () => {
        events.push({ kind: 'attach' })
        const disposers = [
          ctx.slots.register({
            name: 'rightbar.tab', id: 'outline', label: 'Outline', order: 20,
          }, outline),
          ctx.slots.register({
            name: 'rightbar.tab', id: 'history', label: 'History', order: 30,
          }, history),
        ]
        return () => {
          for (const dispose of disposers.reverse()) dispose()
          events.push({ kind: 'detach' })
        }
      })
    },
  }
}
