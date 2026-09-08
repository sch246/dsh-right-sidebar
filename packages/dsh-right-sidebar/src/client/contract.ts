/** Public and renderer-facing contracts of the grouped right-sidebar workbench. */
import type { HostObservable, SessionIdOf } from '@deepseek-ai/dsh-client-ui-slots'

/** Session identity accepted by the right-sidebar client service. */
export type RightSidebarSessionId = SessionIdOf

/** Stable failure categories raised by right-sidebar operations. */
export type RightSidebarErrorCode =
  | 'not-mounted'
  | 'session-mismatch'
  | 'unknown-launcher'
  | 'duplicate-launcher'
  | 'duplicate-restorer'
  | 'unknown-view'
  | 'unknown-instance'
  | 'unknown-group'
  | 'preview-vetoed'
  | 'superseded'
  | 'invalid-restore-descriptor'
  | 'disposed'

/** Validation failure from a right-sidebar workbench operation. */
export class RightSidebarError extends Error {
  /** @param code - Stable category. @param message - Operator diagnostic. */
  constructor(readonly code: RightSidebarErrorCode, message: string) {
    super(message)
    this.name = 'RightSidebarError'
  }
}

/** Horizontal or browser-style vertical tabs. */
export type RightSidebarTabOrientation = 'horizontal' | 'vertical'
/** Direction from a source instance to an existing or newly split group. */
export type RightSidebarDirection = 'center' | 'left' | 'right' | 'up' | 'down'
/** Explicit or relative destination understood by the layout owner. */
export type RightSidebarTarget =
  | { readonly groupId: string }
  | { readonly fromInstanceId: string; readonly direction: RightSidebarDirection }

/** Options controlling placement, preview lifecycle and an existing-instance commit. */
export interface RightSidebarOpenOptions {
  /** Destination; omission uses the active group. */
  target?: RightSidebarTarget
  /** Replace the destination group's unpinned preview. Defaults to `false`. */
  preview?: boolean
  /**
   * Commit callback for an instance that is already open: it returns the reached destination and
   * the group applies presentation, checkpoint, history and cursor together. Without it an
   * existing instance is only activated, which keeps plain opens from appending history.
   * @param instanceId - Id of the existing instance being activated.
   * @returns Destination state after the feature committed its view.
   */
  commit?: (instanceId: string) => RightSidebarNavigationCommit
}

/**
 * Outcome of one feature-owned navigation request.
 * `replaced` means the feature moved the destination in place and the group must only move its cursor.
 */
export type RightSidebarNavigationResult = boolean | 'replaced'

/** One committed destination for an existing instance. */
export interface RightSidebarNavigationCommit {
  /** JSON-safe destination state after the feature committed its view. */
  descriptor: unknown
  /** Replacement tab title. */
  title?: string
  /** Replacement subject-missing marking; omission retains the current marking. */
  resourceMissing?: boolean
  /** Permanently exempt the committed instance from preview replacement. */
  pin?: boolean
}

/** Current in-memory navigation ability of one group. */
export interface RightSidebarGroupNavigation {
  /** True while a ready instance exists before the cursor. */
  readonly canGoBack: boolean
  /** True while a ready instance exists after the cursor. */
  readonly canGoForward: boolean
  /** True while the group is replaying a destination. */
  readonly busy: boolean
}

/** One feature-owned entry on the launcher home. */
export interface RightSidebarLauncher {
  /** Stable launcher identity. */
  id: string
  /** Display label or a callback that resolves it at render time. */
  label: string | (() => string)
  /** Open feature content for one session. */
  open: (sessionId: RightSidebarSessionId, selection?: unknown) => void | Promise<void>
}

/** Values required to open one workbench instance. */
export interface RightSidebarInstanceInput {
  /** Stable identity within the session. */
  id: string
  /** Id of a live `rightbar.view` renderer registration. */
  viewId: string
  /** User-facing tab title. */
  title: string
  /** True while the feature's own subject no longer exists; the tab marks the title accordingly. */
  resourceMissing?: boolean
  /** JSON-safe feature descriptor used after browser reload. */
  restoreDescriptor?: unknown
  /** Return `false` to veto closure; rejection leaves the instance open. */
  onClose?: () => boolean | Promise<boolean>
  /** Release feature state after this exact instance is authoritatively removed. */
  onClosed?: () => void
  /** Apply a saved navigation descriptor while keeping the instance open. */
  onNavigate?: (descriptor: unknown) => RightSidebarNavigationResult | Promise<RightSidebarNavigationResult>
}

/** Mutable presentation fields of an existing instance. */
export interface RightSidebarInstanceUpdate {
  /** Replacement tab title. */
  title?: string
  /** Replacement subject-missing marking; omission retains the current marking. */
  resourceMissing?: boolean
  /** JSON-safe restoration checkpoint; property presence replaces or clears it. */
  restoreDescriptor?: unknown
}

/** Same-instance renderer replacement fields. */
export interface RightSidebarInstanceViewUpdate {
  /** Id of the replacement live renderer. */
  viewId: string
  /** Optional replacement title. */
  title?: string
  /** JSON-safe descriptor for restoration through the replacement renderer. */
  restoreDescriptor?: unknown
  /** Replacement close decision callback. */
  onClose?: () => boolean | Promise<boolean>
  /** Replacement notification after authoritative removal. */
  onClosed?: () => void
  /** Apply a saved navigation descriptor while keeping the instance open. */
  onNavigate?: (descriptor: unknown) => RightSidebarNavigationResult | Promise<RightSidebarNavigationResult>
}

/** Feature callback input for a persisted instance. */
export interface RightSidebarRestoreContext {
  readonly sessionId: RightSidebarSessionId
  readonly instanceId: string
  readonly descriptor: unknown
}

/** Runtime-only values installed after feature state is reconstructed. */
export interface RightSidebarRestoreResult {
  /** Decide whether a restored instance may close. */
  readonly onClose?: () => boolean | Promise<boolean>
  /** Release restored feature state after authoritative removal. */
  readonly onClosed?: () => void
  /** Observe that this exact restoration was authoritatively committed ready. */
  readonly onRestored?: () => void
  /** Apply a saved navigation descriptor while keeping the instance open. */
  readonly onNavigate?: (descriptor: unknown) => RightSidebarNavigationResult | Promise<RightSidebarNavigationResult>
}

/** Reconstruct one feature-owned instance from its persisted descriptor. */
export type RightSidebarRestorer = (
  context: RightSidebarRestoreContext,
) => void | RightSidebarRestoreResult | Promise<void | RightSidebarRestoreResult>

/** Public `ctx.rightSidebar` face for launchers and grouped session instances. */
export interface RightSidebarService {
  /** Register one feature launcher and return its idempotent disposer. */
  registerLauncher(launcher: RightSidebarLauncher): () => void
  /** Register one restoration callback for a renderer id. */
  registerRestorer(viewId: string, restore: RightSidebarRestorer): () => void
  /** Invoke one live launcher for the mounted session. */
  launch(sessionId: RightSidebarSessionId, launcherId: string, selection?: unknown): Promise<void>
  /** Add or activate one instance and return its actual destination group. */
  openInstance(
    sessionId: RightSidebarSessionId,
    instance: RightSidebarInstanceInput,
    options?: RightSidebarOpenOptions,
  ): Promise<string>
  /** Return the group that owns an existing instance. */
  getInstanceGroup(sessionId: RightSidebarSessionId, id: string): string
  /** Resolve an existing group without changing layout. */
  resolveTarget(sessionId: RightSidebarSessionId, target: RightSidebarTarget): string | undefined
  /** Activate an existing instance and reveal details. */
  activateInstance(sessionId: RightSidebarSessionId, id: string): void
  /** Permanently exempt an instance from preview replacement. */
  pinInstance(sessionId: RightSidebarSessionId, id: string): void
  /** Update title or restoration checkpoint without changing group, order or selection. */
  updateInstance(sessionId: RightSidebarSessionId, id: string, update: RightSidebarInstanceUpdate): void
  /** Replace a renderer without changing instance identity, group or order. */
  switchInstanceView(
    sessionId: RightSidebarSessionId,
    id: string,
    update: RightSidebarInstanceViewUpdate,
  ): void
  /** Ask an instance to close and remove it unless its callback vetoes. */
  closeInstance(sessionId: RightSidebarSessionId, id: string): Promise<void>
  /** Record the current feature navigation state for an instance. */
  recordNavigation(sessionId: RightSidebarSessionId, id: string): void
  /**
   * Commit one reached destination for an existing instance: presentation fields, restoration
   * checkpoint, group history and cursor in one step. Rejection leaves history and cursor unchanged.
   * @param sessionId - Owning session.
   * @param id - Reached instance.
   * @param commit - Committed destination state.
   * @throws RightSidebarError When the instance, its group or the runtime is gone.
   */
  commitNavigation(sessionId: RightSidebarSessionId, id: string, commit: RightSidebarNavigationCommit): void
  /** Read one group's current in-memory navigation ability without changing it. */
  getNavigation(sessionId: RightSidebarSessionId, groupId: string): RightSidebarGroupNavigation
  /** Move within the owning group's in-memory navigation history. */
  navigateHistory(sessionId: RightSidebarSessionId, groupId: string, direction: -1 | 1): Promise<void>
}

/** Owner props passed to one static view renderer. */
export interface RightbarViewOwnerProps {
  /** Opaque feature instance identity used to resolve feature-owned state. */
  instanceId: string
}

/** Current ability to render a restored instance. */
export type RightSidebarInstanceAvailability = 'ready' | 'missing' | 'restoring' | 'failed'

/** Immutable instance fields rendered by the workbench shell. */
export interface RightSidebarInstance {
  readonly id: string
  readonly viewId: string
  readonly title: string
  readonly preview: boolean
  /** True while the feature reports that its own subject no longer exists. */
  readonly resourceMissing: boolean
  readonly availability: RightSidebarInstanceAvailability
}

/** One leaf in the sole session layout tree. */
export interface RightSidebarGroup {
  readonly kind: 'group'
  readonly id: string
  readonly tabOrientation: RightSidebarTabOrientation
  readonly verticalRailWidth: number
  readonly instances: readonly RightSidebarInstance[]
  readonly activeInstanceId: string | undefined
}

/** One resizable branch in the sole session layout tree. */
export interface RightSidebarSplit {
  readonly kind: 'split'
  readonly id: string
  readonly axis: 'horizontal' | 'vertical'
  readonly ratio: number
  readonly first: RightSidebarLayoutNode
  readonly second: RightSidebarLayoutNode
}

/** Recursive session layout node. */
export type RightSidebarLayoutNode = RightSidebarGroup | RightSidebarSplit

/** Current runtime-owned projection for one session. */
export interface RightSidebarWorkbench {
  readonly root: RightSidebarLayoutNode
  readonly activeGroupId: string
  readonly defaultTabOrientation: RightSidebarTabOrientation
}

/** Launcher row consumed by the launcher home. */
export interface RightSidebarLauncherEntry {
  readonly id: string
  readonly label: string | (() => string)
}

/** Drop destination produced by panel hit testing. */
export interface RightSidebarMoveTarget {
  readonly groupId: string
  readonly direction: RightSidebarDirection
  readonly index?: number
}

/** Injected face of the details-column panel entry. */
export interface PanelInjected {
  hooks: {
    /** Runtime-owned workbench state for the renderer-bound session. */
    workbench: HostObservable<RightSidebarWorkbench>
    /** Live launcher registration ledger. */
    launchers: HostObservable<readonly RightSidebarLauncherEntry[]>
  }
  /** Activate this renderer binding while the panel is mounted. */
  mountWorkbench(): () => void
  /** Select launcher home in the active group. */
  showLauncher(): void
  /** Invoke a launcher for this renderer binding. */
  launch(launcherId: string): Promise<void>
  /** Activate one instance for this renderer binding. */
  activateInstance(id: string): void
  /** Make one leaf the destination for launcher and default-open operations. */
  activateGroup(groupId: string): void
  /** Permanently pin an instance. */
  pinInstance(id: string): void
  /** Close one instance for this renderer binding. */
  closeInstance(id: string): Promise<void>
  /** Retry persisted feature-state reconstruction. */
  retryRestore(id: string): Promise<void>
  /** Move or split one instance, pinning it after placement. */
  moveInstance(id: string, target: RightSidebarMoveTarget): void
  /** Change one group's tab orientation. */
  setGroupTabOrientation(groupId: string, orientation: RightSidebarTabOrientation): void
  /** Retain one group's vertical rail width. */
  setGroupVerticalRailWidth(groupId: string, width: number): void
  /** Change the default used by subsequently created groups. */
  setDefaultTabOrientation(orientation: RightSidebarTabOrientation): void
  /** Resize one split branch. */
  setSplitRatio(splitId: string, ratio: number): void
  /** Navigate the group's in-memory feature history. */
  navigateHistory(groupId: string, direction: -1 | 1): Promise<void>
  /** Return whether the group can navigate and whether navigation is pending. */
  getNavigation(groupId: string): RightSidebarGroupNavigation
  /** Take the newest focus handoff requested by a committed navigation. */
  takeFocusRequest(): { readonly groupId: string } | undefined
}

/** Injected face of the application navbar toggle. */
export interface ToggleInjected {
  /** Toggle the details column through ctx.layout. */
  toggleDetails(detailsOpen: boolean): void
  /** Toggle whether details occupies all space after the left sidebar. */
  toggleDetailsMaximized(): void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Right-sidebar workbench service; Host layout state stays private. */
    rightSidebar: RightSidebarService
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** Static renderer selected by each runtime-owned instance. */
    'rightbar.view': {
      kind: 'list'
      scope: 'session'
      owner: RightbarViewOwnerProps
    }
  }
}
