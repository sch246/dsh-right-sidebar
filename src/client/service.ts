/** Runtime owner of the stable `ctx.rightSidebar` tab-opening service. */
import type { Context } from '@deepseek-ai/cordis'
import type { BoundActions } from '@deepseek-ai/dsh-client-store'
import type {
  RightSidebarService, RightSidebarSessionId,
} from './contract'
import { RightSidebarOpenTabError } from './contract'
import { createRightSidebarStore } from './stores'

type RightSidebarActions = BoundActions<ReturnType<typeof createRightSidebarStore>>

interface MountedBinding {
  readonly sessionId: RightSidebarSessionId
  readonly actions: RightSidebarActions
}

/** Internal service implementation; the public Context face exposes only `openTab`. */
export class RightSidebarRuntime implements RightSidebarService {
  readonly #ctx: Context
  #binding: MountedBinding | undefined
  #disposed = false

  /** @param ctx - Client context supplying the live tab ledger and layout service. */
  constructor(ctx: Context) {
    this.#ctx = ctx
  }

  /** @inheritdoc */
  openTab(sessionId: RightSidebarSessionId, tabId: string): void {
    const binding = this.#binding
    if (this.#disposed || binding === undefined) {
      throw new RightSidebarOpenTabError(
        'not-mounted',
        'right-sidebar: no details panel is mounted',
      )
    }
    if (binding.sessionId !== sessionId) {
      throw new RightSidebarOpenTabError(
        'session-mismatch',
        `right-sidebar: mounted session "${String(binding.sessionId)}" does not match requested session "${String(sessionId)}"`,
      )
    }
    if (!this.#ctx.slots.entries('rightbar.tab').some(entry => entry.options.id === tabId)) {
      throw new RightSidebarOpenTabError(
        'unknown-tab',
        `right-sidebar: tab "${tabId}" is not registered`,
      )
    }
    binding.actions.setActiveTab(tabId)
    this.#ctx.layout.openDetails()
  }

  /**
   * Make one framework-bound session/actions pair current until its panel unmounts.
   * @param sessionId - Framework-resolved details session.
   * @param actions - Baked actions for that details store instance.
   * @returns Idempotent disposer that clears this binding if it is still current.
   */
  mount(sessionId: RightSidebarSessionId, actions: RightSidebarActions): () => void {
    if (this.#disposed) {
      throw new RightSidebarOpenTabError('not-mounted', 'right-sidebar: client service is disposed')
    }
    const binding: MountedBinding = { sessionId, actions }
    this.#binding = binding
    return () => {
      if (this.#binding === binding) this.#binding = undefined
    }
  }

  /** Permanently invalidate this runtime and any retained renderer binding. */
  dispose(): void {
    this.#disposed = true
    this.#binding = undefined
  }
}
