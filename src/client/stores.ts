/**
 * Per-session right-sidebar store. It owns only the selected tab; column
 * visibility and geometry remain authoritative in the official layout store.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'

/** Declared state shape (consumers read through useStore selectors). */
export type RightSidebarState = {
  /** Id of the active `rightbar.tab` entry (empty until the panel picks the first tab). */
  activeTab: string
}

/** Annotation twin of the actions literal below. */
type RightSidebarActions = {
  setActiveTab: (draft: RightSidebarState, tab: string) => void
}

/**
 * Create the shared right-sidebar store handle. The plugin creates its handle
 * at apply time so identity follows the fiber; the framework instantiates one
 * per session.
 * @returns the store handle.
 */
export function createRightSidebarStore(): EngineStoreHandle<RightSidebarState, RightSidebarActions> {
  return defineStore({
    init: (): RightSidebarState => ({ activeTab: '' }),
    actions: {
      setActiveTab: (d, tab: string) => { d.activeTab = tab },
    },
  })
}
