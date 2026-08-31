/**
 * Cross-plugin contracts of the right-sidebar platform: the public
 * `rightbar.tab` registration seat (third-party plugins register their own
 * tabs here), the tab-projection face the panel consumes, and the injected
 * faces of the two base entries.
 *
 * Consumers import `type {} from '@dsh-external/dsh-right-sidebar/client'`
 * to merge the SlotMap key into their own program.
 */
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'

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
}

/** Injected face of the application navbar toggle. */
export interface ToggleInjected {
  /** Toggle the details column from its resolved visible state through ctx.layout. */
  toggleDetails(detailsOpen: boolean): void
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
