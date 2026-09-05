/** Public and renderer-facing contracts of the right-sidebar workbench. */
import type { HostObservable, SessionIdOf } from '@deepseek-ai/dsh-client-ui-slots'

/** Session identity accepted by the right-sidebar client service. */
export type RightSidebarSessionId = SessionIdOf

/** Stable failure categories raised by right-sidebar operations. */
export type RightSidebarErrorCode =
  | 'not-mounted'
  | 'session-mismatch'
  | 'unknown-launcher'
  | 'duplicate-launcher'
  | 'unknown-view'
  | 'unknown-instance'
  | 'disposed'

/** Validation failure from a right-sidebar workbench operation. */
export class RightSidebarError extends Error {
  /**
   * @param code - Stable machine-readable failure category.
   * @param message - Diagnostic text for operators and developers.
   */
  constructor(
    readonly code: RightSidebarErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'RightSidebarError'
  }
}

/** One feature-owned entry on the launcher home. */
export interface RightSidebarLauncher {
  /** Stable launcher identity. */
  id: string
  /** Display label or a callback that resolves it at render time. */
  label: string | (() => string)
  /**
   * Open or focus feature content for one session.
   * @param sessionId - Session bound to the mounted workbench.
   * @param selection - Optional feature-defined selection supplied by the caller.
   * @returns Nothing after feature opening completes.
   */
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
  /** Return `false` to veto closure; rejection leaves the instance open. View disposal bypasses this callback. */
  onClose?: () => boolean | Promise<boolean>
}

/** Mutable presentation fields of an existing instance. */
export interface RightSidebarInstanceUpdate {
  /** Replacement tab title. */
  title?: string
}

/**
 * Public `ctx.rightSidebar` face for launchers and session workbench instances.
 * Removing a view registration forcibly removes its instances from every session without calling `onClose`.
 */
export interface RightSidebarService {
  /**
   * Register one feature launcher.
   * @param launcher - Stable launcher identity, label and open callback.
   * @returns Idempotent disposer for exactly this registration.
   * @throws {@link RightSidebarError} when the id is already registered or the runtime is disposed.
   */
  registerLauncher(launcher: RightSidebarLauncher): () => void
  /**
   * Invoke one live launcher for the mounted session.
   * @param sessionId - Session that must own the mounted details occurrence.
   * @param launcherId - Id of a live launcher registration.
   * @param selection - Optional feature-defined selection.
   * @returns Nothing after feature opening completes.
   * @throws {@link RightSidebarError} when the session or launcher is unavailable.
   */
  launch(sessionId: RightSidebarSessionId, launcherId: string, selection?: unknown): Promise<void>
  /**
   * Add or activate one instance and reveal the details column.
   * @param sessionId - Session that must own the mounted details occurrence.
   * @param instance - Stable instance, renderer and title fields.
   * @throws {@link RightSidebarError} before side effects when the session or view is unavailable.
   */
  openInstance(sessionId: RightSidebarSessionId, instance: RightSidebarInstanceInput): void
  /**
   * Activate an existing instance in the mounted session.
   * @param sessionId - Session that must own the mounted details occurrence.
   * @param id - Existing instance id.
   * @throws {@link RightSidebarError} when the session or instance is unavailable.
   */
  activateInstance(sessionId: RightSidebarSessionId, id: string): void
  /**
   * Update presentation fields without changing instance order or selection.
   * @param sessionId - Session that owns the instance.
   * @param id - Existing instance id.
   * @param update - Fields to replace.
   * @throws {@link RightSidebarError} when the instance is unavailable.
   */
  updateInstance(sessionId: RightSidebarSessionId, id: string, update: RightSidebarInstanceUpdate): void
  /**
   * Ask an instance to close and remove it unless its callback vetoes. Concurrent calls for the same
   * instance share one operation; its completion cannot remove an updated or reopened instance.
   * @param sessionId - Session that owns the instance.
   * @param id - Existing instance id.
   * @returns Nothing after the close callback and guarded removal complete.
   * @throws {@link RightSidebarError} when the instance is unavailable; callback rejection is preserved.
   */
  closeInstance(sessionId: RightSidebarSessionId, id: string): Promise<void>
}

/** Owner props passed to one static view renderer. */
export interface RightbarViewOwnerProps {
  /** Opaque feature instance identity used to resolve feature-owned state. */
  instanceId: string
}

/** Immutable instance fields rendered by the workbench shell. */
export interface RightSidebarInstance {
  readonly id: string
  readonly viewId: string
  readonly title: string
}

/** Current runtime-owned projection for one session. */
export interface RightSidebarWorkbench {
  readonly instances: readonly RightSidebarInstance[]
  readonly activeInstanceId: string | undefined
}

/** Launcher row consumed by the launcher home. */
export interface RightSidebarLauncherEntry {
  readonly id: string
  readonly label: string | (() => string)
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
  /** Select launcher home without removing open instances. */
  showLauncher(): void
  /** Invoke a launcher for this renderer binding. */
  launch(launcherId: string): Promise<void>
  /** Activate one instance for this renderer binding. */
  activateInstance(id: string): void
  /** Close one instance for this renderer binding. */
  closeInstance(id: string): Promise<void>
}

/** Injected face of the application navbar toggle. */
export interface ToggleInjected {
  /** Toggle the details column from its resolved visible state through ctx.layout. */
  toggleDetails(detailsOpen: boolean): void
  /** Toggle whether the open details column occupies all space after the left sidebar. */
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
    /** Static feature renderer selected by each runtime-owned instance. */
    'rightbar.view': {
      kind: 'list'
      scope: 'session'
      owner: RightbarViewOwnerProps
    }
  }
}
