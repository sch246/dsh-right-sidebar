/**
 * Cross-plugin contracts of the right-sidebar platform: the public
 * `rightbar.tab` registration seat (third-party plugins register their own
 * tabs here), the public tab-opening service, the tab-projection face the
 * panel consumes, and the injected faces of the two base entries.
 *
 * Consumers import `type {} from '@dsh-external/dsh-right-sidebar/client'`
 * to merge the SlotMap key into their own program.
 */
import type { HostObservable, SessionIdOf } from '@deepseek-ai/dsh-client-ui-slots'

/** Session identity accepted by the right-sidebar client service. */
export type RightSidebarSessionId = SessionIdOf

/** Stable validation categories raised by {@link RightSidebarService.openTab}. */
export type RightSidebarOpenTabErrorCode = 'not-mounted' | 'session-mismatch' | 'unknown-tab'

/** Validation failure from a programmatic tab-opening request. */
export class RightSidebarOpenTabError extends Error {
  /**
   * @param code - Stable machine-readable failure category.
   * @param message - Diagnostic text for operators and developers.
   */
  constructor(
    readonly code: RightSidebarOpenTabErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'RightSidebarOpenTabError'
  }
}

/** Public `ctx.rightSidebar` face for selecting and revealing registered tabs. */
export interface RightSidebarService {
  /**
   * Select a live tab for the currently mounted session, then open the column.
   * Validation failures do not change the tab selection or layout visibility.
   * @param sessionId - Session that must own the mounted details occurrence.
   * @param tabId - Id of a live `rightbar.tab` registration.
   * @returns Nothing after the selection and layout writes complete.
   * @throws {@link RightSidebarOpenTabError} when the panel is not mounted, the
   * session differs, or the tab is absent from the live registration ledger.
   */
  openTab(sessionId: RightSidebarSessionId, tabId: string): void
}

/** Owner share of one right-sidebar tab: the render site supplies nothing. */
export interface RightbarTabOwnerProps {}

/** Projected row of one tab entry (id is the registration id, label its display name). */
export interface RightbarTab {
  id: string
  label: string
}

/** Injected face of the details-column panel entry. */
export interface PanelInjected {
  hooks: {
    /** Live, locale-aware projection of the `rightbar.tab` ledger. */
    tabs: HostObservable<readonly RightbarTab[]>
  }
  /** Activate this renderer-bound session/actions pair while the panel is mounted. */
  mountOpenTabApi(): () => void
}

/** Injected face of the application navbar toggle. */
export interface ToggleInjected {
  /** Toggle the details column from its resolved visible state through ctx.layout. */
  toggleDetails(detailsOpen: boolean): void
  /** Toggle whether the open details column occupies the full application width. */
  toggleDetailsMaximized(): void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Stable right-sidebar client service; store handles and actions stay private. */
    rightSidebar: RightSidebarService
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * One right-sidebar tab, rendered one-at-a-time by the panel via
     * `only: <active id>`. Additive list slot: third-party plugins register
     * tabs with id/order/label, exactly like the official `conversation.view`
     * ring. Declared by this package's details-column entry.
     */
    'rightbar.tab': { kind: 'list'; scope: 'session'; owner: RightbarTabOwnerProps }
  }
}
