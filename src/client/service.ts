/** Sole runtime owner of launcher registrations and per-session workbench state. */
import type { Context } from '@deepseek-ai/cordis'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  PanelInjected,
  RightSidebarInstance,
  RightSidebarInstanceInput,
  RightSidebarInstanceUpdate,
  RightSidebarLauncher,
  RightSidebarLauncherEntry,
  RightSidebarService,
  RightSidebarSessionId,
  RightSidebarWorkbench,
} from './contract'
import { RightSidebarError } from './contract'

interface RuntimeInstance extends RightSidebarInstance {
  readonly onClose?: () => boolean | Promise<boolean>
}

interface SessionRecord {
  snapshot: RightSidebarWorkbench
  readonly listeners: Set<() => void>
  readonly source: HostObservable<RightSidebarWorkbench>
}

interface LauncherRegistration extends RightSidebarLauncherEntry {
  readonly open: RightSidebarLauncher['open']
}

interface PanelBinding {
  readonly sessionId: RightSidebarSessionId
}

interface ClosingOperation {
  readonly instance: RuntimeInstance
  readonly promise: Promise<void>
}

const EMPTY_WORKBENCH: RightSidebarWorkbench = Object.freeze({
  instances: Object.freeze([]),
  activeInstanceId: undefined,
})

/** Internal implementation behind the frozen public Context service. */
export class RightSidebarRuntime implements RightSidebarService {
  readonly #ctx: Context
  readonly #sessions = new Map<RightSidebarSessionId, SessionRecord>()
  readonly #launcherListeners = new Set<() => void>()
  readonly #closing = new Map<RightSidebarSessionId, Map<string, ClosingOperation>>()
  readonly #offViewChanges: () => void
  #launchers: readonly LauncherRegistration[] = Object.freeze([])
  #binding: PanelBinding | undefined
  #disposed = false

  readonly #launcherSource: HostObservable<readonly RightSidebarLauncherEntry[]> = {
    getSnapshot: () => this.#launchers,
    subscribe: listener => {
      this.#launcherListeners.add(listener)
      return () => { this.#launcherListeners.delete(listener) }
    },
  }

  /** @param ctx - Client context supplying the live view ledger and Host layout service. */
  constructor(ctx: Context) {
    this.#ctx = ctx
    this.#offViewChanges = ctx.on('slots/changed', (key) => {
      if (key === 'rightbar.view') this.#removeInstancesWithoutViews()
    })
  }

  /** @inheritdoc */
  registerLauncher(launcher: RightSidebarLauncher): () => void {
    this.#assertAlive()
    if (this.#launchers.some(current => current.id === launcher.id)) {
      throw new RightSidebarError(
        'duplicate-launcher',
        `right-sidebar: launcher "${launcher.id}" is already registered`,
      )
    }
    const registration: LauncherRegistration = Object.freeze({ ...launcher })
    this.#launchers = Object.freeze([...this.#launchers, registration])
    this.#notify(this.#launcherListeners)
    let active = true
    return () => {
      if (!active) return
      active = false
      if (!this.#launchers.includes(registration)) return
      this.#launchers = Object.freeze(this.#launchers.filter(row => row !== registration))
      this.#notify(this.#launcherListeners)
    }
  }

  /** @inheritdoc */
  async launch(
    sessionId: RightSidebarSessionId,
    launcherId: string,
    selection?: unknown,
  ): Promise<void> {
    this.#assertMounted(sessionId)
    const launcher = this.#launchers.find(current => current.id === launcherId)
    if (launcher === undefined) {
      throw new RightSidebarError(
        'unknown-launcher',
        `right-sidebar: launcher "${launcherId}" is not registered`,
      )
    }
    await launcher.open(sessionId, selection)
  }

  /** @inheritdoc */
  openInstance(sessionId: RightSidebarSessionId, instance: RightSidebarInstanceInput): void {
    this.#assertMounted(sessionId)
    if (!this.#ctx.slots.entries('rightbar.view').some(entry => entry.options.id === instance.viewId)) {
      throw new RightSidebarError(
        'unknown-view',
        `right-sidebar: view "${instance.viewId}" is not registered`,
      )
    }

    const session = this.#session(sessionId)
    const existing = session.snapshot.instances.find(current => current.id === instance.id)
    if (existing === undefined) {
      const opened: RuntimeInstance = Object.freeze({ ...instance })
      this.#write(session, {
        instances: Object.freeze([...session.snapshot.instances, opened]),
        activeInstanceId: opened.id,
      })
    } else if (session.snapshot.activeInstanceId !== existing.id) {
      this.#write(session, { ...session.snapshot, activeInstanceId: existing.id })
    }
    this.#ctx.layout.openDetails()
  }

  /** @inheritdoc */
  activateInstance(sessionId: RightSidebarSessionId, id: string): void {
    this.#assertMounted(sessionId)
    this.#activate(sessionId, id)
  }

  /** @inheritdoc */
  updateInstance(
    sessionId: RightSidebarSessionId,
    id: string,
    update: RightSidebarInstanceUpdate,
  ): void {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    const index = session.snapshot.instances.findIndex(current => current.id === id)
    const current = session.snapshot.instances[index] as RuntimeInstance
    if (update.title === undefined || update.title === current.title) return
    const instances = [...session.snapshot.instances]
    instances[index] = Object.freeze({ ...current, title: update.title })
    this.#write(session, { ...session.snapshot, instances: Object.freeze(instances) })
  }

  /** @inheritdoc */
  closeInstance(sessionId: RightSidebarSessionId, id: string): Promise<void> {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    const instance = session.snapshot.instances.find(current => current.id === id) as RuntimeInstance
    const pending = this.#closing.get(sessionId)?.get(id)
    if (pending?.instance === instance) return pending.promise

    const promise = Promise.resolve().then(() => this.#close(sessionId, session, instance))
    const operation: ClosingOperation = { instance, promise }
    let sessionClosing = this.#closing.get(sessionId)
    if (sessionClosing === undefined) {
      sessionClosing = new Map()
      this.#closing.set(sessionId, sessionClosing)
    }
    sessionClosing.set(id, operation)
    void promise.finally(() => {
      const current = this.#closing.get(sessionId)
      if (current?.get(id) !== operation) return
      current.delete(id)
      if (current.size === 0) this.#closing.delete(sessionId)
    }).catch(() => {})
    return promise
  }

  /**
   * Create the renderer face for one session occurrence.
   * @param sessionId - Framework-resolved details session.
   * @returns Hooks and actions authorized only while this face is mounted.
   */
  createPanelFace(sessionId: RightSidebarSessionId): PanelInjected {
    const binding: PanelBinding = { sessionId }
    const session = this.#session(sessionId)
    return {
      hooks: {
        workbench: session.source,
        launchers: this.#launcherSource,
      },
      mountWorkbench: () => this.#mount(binding),
      showLauncher: () => {
        this.#assertBinding(binding)
        if (session.snapshot.activeInstanceId !== undefined) {
          this.#write(session, { ...session.snapshot, activeInstanceId: undefined })
        }
      },
      launch: async (launcherId: string) => {
        this.#assertBinding(binding)
        await this.launch(sessionId, launcherId)
      },
      activateInstance: (id: string) => {
        this.#assertBinding(binding)
        this.#activate(sessionId, id)
      },
      closeInstance: async (id: string) => {
        this.#assertBinding(binding)
        await this.closeInstance(sessionId, id)
      },
    }
  }

  /** Permanently invalidate this runtime and all renderer bindings. */
  dispose(): void {
    if (this.#disposed) return
    this.#disposed = true
    this.#binding = undefined
    this.#offViewChanges()
    this.#launchers = Object.freeze([])
    this.#notify(this.#launcherListeners)
    for (const session of this.#sessions.values()) {
      session.snapshot = EMPTY_WORKBENCH
      this.#notify(session.listeners)
    }
    this.#launcherListeners.clear()
    for (const session of this.#sessions.values()) session.listeners.clear()
    this.#sessions.clear()
    this.#closing.clear()
  }

  async #close(
    sessionId: RightSidebarSessionId,
    session: SessionRecord,
    instance: RuntimeInstance,
  ): Promise<void> {
    if (!this.#isCurrent(sessionId, session, instance)) return
    if (instance.onClose !== undefined && await instance.onClose() === false) return
    if (!this.#isCurrent(sessionId, session, instance)) return
    const index = session.snapshot.instances.indexOf(instance)
    const instances = session.snapshot.instances.filter(current => current !== instance)
    let activeInstanceId = session.snapshot.activeInstanceId
    if (activeInstanceId === instance.id) {
      activeInstanceId = instances[index]?.id ?? instances[index - 1]?.id
    }
    this.#write(session, { instances: Object.freeze(instances), activeInstanceId })
  }

  #isCurrent(
    sessionId: RightSidebarSessionId,
    session: SessionRecord,
    instance: RuntimeInstance,
  ): boolean {
    return !this.#disposed
      && this.#sessions.get(sessionId) === session
      && session.snapshot.instances.includes(instance)
  }

  #activate(sessionId: RightSidebarSessionId, id: string): void {
    const session = this.#knownSession(sessionId, id)
    if (session.snapshot.activeInstanceId === id) return
    this.#write(session, { ...session.snapshot, activeInstanceId: id })
  }

  #removeInstancesWithoutViews(): void {
    if (this.#disposed) return
    const liveViews = new Set(
      this.#ctx.slots.entries('rightbar.view').map(entry => entry.options.id),
    )
    for (const session of this.#sessions.values()) {
      const previous = session.snapshot
      const instances = previous.instances.filter(instance => liveViews.has(instance.viewId))
      if (instances.length === previous.instances.length) continue

      let activeInstanceId = previous.activeInstanceId
      if (activeInstanceId !== undefined && !instances.some(instance => instance.id === activeInstanceId)) {
        const activeIndex = previous.instances.findIndex(instance => instance.id === activeInstanceId)
        activeInstanceId = previous.instances
          .slice(activeIndex + 1)
          .find(instance => liveViews.has(instance.viewId))?.id
          ?? previous.instances
            .slice(0, activeIndex)
            .findLast(instance => liveViews.has(instance.viewId))?.id
      }
      this.#write(session, { instances: Object.freeze(instances), activeInstanceId })
    }
  }

  #mount(binding: PanelBinding): () => void {
    this.#assertAlive()
    this.#binding = binding
    return () => {
      if (this.#binding === binding) this.#binding = undefined
    }
  }

  #assertBinding(binding: PanelBinding): void {
    this.#assertAlive()
    if (this.#binding !== binding) {
      throw new RightSidebarError('not-mounted', 'right-sidebar: renderer binding is not mounted')
    }
  }

  #assertMounted(sessionId: RightSidebarSessionId): void {
    this.#assertAlive()
    const binding = this.#binding
    if (binding === undefined) {
      throw new RightSidebarError('not-mounted', 'right-sidebar: no details panel is mounted')
    }
    if (binding.sessionId !== sessionId) {
      throw new RightSidebarError(
        'session-mismatch',
        `right-sidebar: mounted session "${String(binding.sessionId)}" does not match requested session "${String(sessionId)}"`,
      )
    }
  }

  #assertAlive(): void {
    if (this.#disposed) {
      throw new RightSidebarError('disposed', 'right-sidebar: client runtime is disposed')
    }
  }

  #knownSession(sessionId: RightSidebarSessionId, instanceId: string): SessionRecord {
    const session = this.#sessions.get(sessionId)
    if (session === undefined || !session.snapshot.instances.some(current => current.id === instanceId)) {
      throw new RightSidebarError(
        'unknown-instance',
        `right-sidebar: instance "${instanceId}" is not open for session "${String(sessionId)}"`,
      )
    }
    return session
  }

  #session(sessionId: RightSidebarSessionId): SessionRecord {
    const existing = this.#sessions.get(sessionId)
    if (existing !== undefined) return existing
    const listeners = new Set<() => void>()
    const record: SessionRecord = {
      snapshot: EMPTY_WORKBENCH,
      listeners,
      source: {
        getSnapshot: () => record.snapshot,
        subscribe: listener => {
          listeners.add(listener)
          return () => { listeners.delete(listener) }
        },
      },
    }
    this.#sessions.set(sessionId, record)
    return record
  }

  #write(session: SessionRecord, snapshot: RightSidebarWorkbench): void {
    session.snapshot = Object.freeze(snapshot)
    this.#notify(session.listeners)
  }

  #notify(listeners: ReadonlySet<() => void>): void {
    for (const listener of [...listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('right-sidebar: workbench subscriber failed:', error)
      }
    }
  }
}
