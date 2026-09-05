/** Sole runtime owner of launcher registrations and per-session grouped layouts. */
import type { Context } from '@deepseek-ai/cordis'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  PanelInjected,
  RightSidebarGroup,
  RightSidebarInstance,
  RightSidebarInstanceInput,
  RightSidebarInstanceUpdate,
  RightSidebarInstanceViewUpdate,
  RightSidebarLauncher,
  RightSidebarLauncherEntry,
  RightSidebarLayoutNode,
  RightSidebarMoveTarget,
  RightSidebarOpenOptions,
  RightSidebarRestorer,
  RightSidebarService,
  RightSidebarSessionId,
  RightSidebarTabOrientation,
  RightSidebarTarget,
  RightSidebarWorkbench,
} from './contract'
import { RightSidebarError } from './contract'
import {
  collapseGroup,
  findGroup,
  groupContaining,
  groupsOf,
  mapGroup,
  mapSplit,
  resolveDirectionalGroup,
  splitGroup,
} from './layout'

interface RuntimeInstance extends RightSidebarInstance {
  readonly restoreDescriptor?: unknown
  readonly onClose?: () => boolean | Promise<boolean>
  readonly onClosed?: () => void
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
  readonly promise: Promise<boolean>
}

interface PersistedInstance {
  readonly id: string
  readonly viewId: string
  readonly title: string
  readonly preview: boolean
  readonly restoreDescriptor?: unknown
}

interface PersistedGroup {
  readonly kind: 'group'
  readonly id: string
  readonly tabOrientation: RightSidebarTabOrientation
  readonly verticalRailWidth: number
  readonly instances: readonly PersistedInstance[]
  readonly activeInstanceId?: string
}

interface PersistedSplit {
  readonly kind: 'split'
  readonly id: string
  readonly axis: 'horizontal' | 'vertical'
  readonly ratio: number
  readonly first: PersistedNode
  readonly second: PersistedNode
}

type PersistedNode = PersistedGroup | PersistedSplit

interface PersistedWorkbench {
  readonly root: PersistedNode
  readonly activeGroupId: string
  readonly defaultTabOrientation: RightSidebarTabOrientation
}

interface PersistedPayload {
  readonly version: 1
  readonly sessions: Readonly<Record<string, PersistedWorkbench>>
}

const STORAGE_KEY = '@dsh-external/dsh-right-sidebar/workbench/1'
const INVALID_STORAGE_KEY = '@dsh-external/dsh-right-sidebar/workbench/1-invalid-backup'
const DEFAULT_RAIL_WIDTH = 180

/** Internal implementation behind the frozen public Context service. */
export class RightSidebarRuntime implements RightSidebarService {
  readonly #ctx: Context
  readonly #sessions = new Map<RightSidebarSessionId, SessionRecord>()
  readonly #launcherListeners = new Set<() => void>()
  readonly #closing = new Map<RightSidebarSessionId, Map<string, ClosingOperation>>()
  readonly #restorers = new Map<string, RightSidebarRestorer>()
  readonly #openGenerations = new Map<string, number>()
  readonly #offViewChanges: () => void
  readonly #persisted: Record<string, PersistedWorkbench>
  #launchers: readonly LauncherRegistration[] = Object.freeze([])
  #binding: PanelBinding | undefined
  #disposed = false
  #nextIdentity = 1

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
    this.#persisted = readPersisted()
    this.#offViewChanges = ctx.on('slots/changed', (key) => {
      if (key === 'rightbar.view') this.#reconcileViews()
    })
  }

  /** @inheritdoc */
  registerLauncher(launcher: RightSidebarLauncher): () => void {
    this.#assertAlive()
    if (this.#launchers.some(current => current.id === launcher.id)) {
      throw new RightSidebarError('duplicate-launcher', `right-sidebar: launcher "${launcher.id}" is already registered`)
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
  registerRestorer(viewId: string, restore: RightSidebarRestorer): () => void {
    this.#assertAlive()
    if (this.#restorers.has(viewId)) {
      throw new RightSidebarError('duplicate-restorer', `right-sidebar: restorer "${viewId}" is already registered`)
    }
    this.#restorers.set(viewId, restore)
    void this.#restoreView(viewId)
    let active = true
    return () => {
      if (!active) return
      active = false
      if (this.#restorers.get(viewId) !== restore) return
      this.#restorers.delete(viewId)
      this.#markViewMissing(viewId)
    }
  }

  /** @inheritdoc */
  async launch(sessionId: RightSidebarSessionId, launcherId: string, selection?: unknown): Promise<void> {
    this.#assertMounted(sessionId)
    const launcher = this.#launchers.find(current => current.id === launcherId)
    if (launcher === undefined) {
      throw new RightSidebarError('unknown-launcher', `right-sidebar: launcher "${launcherId}" is not registered`)
    }
    await launcher.open(sessionId, selection)
  }

  /** @inheritdoc */
  async openInstance(
    sessionId: RightSidebarSessionId,
    input: RightSidebarInstanceInput,
    options: RightSidebarOpenOptions = {},
  ): Promise<string> {
    this.#assertMounted(sessionId)
    this.#assertView(input.viewId)
    const restoreDescriptor = cloneDescriptor(input.restoreDescriptor)
    const session = this.#session(sessionId)
    const existingGroup = groupContaining(session.snapshot.root, input.id)
    if (existingGroup !== undefined) {
      this.#advanceOpenGeneration(`${String(sessionId)}\u0000group:${existingGroup.id}`)
      const existing = existingGroup.instances.find(instance => instance.id === input.id) as RuntimeInstance
      this.#replaceInstance(session, existingGroup, existing, Object.freeze({
        ...existing,
        preview: options.preview === true ? existing.preview : false,
      }))
      this.#activate(session, existingGroup.id, input.id)
      this.#ctx.layout.openDetails()
      return existingGroup.id
    }

    let targetGroup = this.#resolveOpenGroup(session, options.target)
    const operationKey = `${String(sessionId)}\u0000${targetGroup === undefined
      ? targetKey(options.target, session.snapshot.activeGroupId)
      : `group:${targetGroup.id}`}`
    const generation = this.#advanceOpenGeneration(operationKey)
    const priorPreview = options.preview === true
      ? targetGroup?.instances.find(instance => instance.preview) as RuntimeInstance | undefined
      : undefined
    if (priorPreview !== undefined) {
      const closed = await this.#requestClose(sessionId, priorPreview)
      this.#assertOpenCurrent(operationKey, generation)
      if (!closed) {
        throw new RightSidebarError('preview-vetoed', `right-sidebar: preview "${priorPreview.id}" vetoed replacement`)
      }
      const currentGroup = groupContaining(session.snapshot.root, priorPreview.id)
      if (currentGroup !== undefined && currentGroup.instances.includes(priorPreview)) {
        this.#removeInstance(session, currentGroup, priorPreview, false)
      }
      targetGroup = this.#resolveOpenGroup(session, options.target)
      if (targetGroup?.instances.some(instance => instance.preview) === true) {
        throw new RightSidebarError(
          'superseded',
          'right-sidebar: preview changed while its close decision was pending',
        )
      }
    }
    this.#assertOpenCurrent(operationKey, generation)

    let groupId = targetGroup?.id
    let root = session.snapshot.root
    if (groupId === undefined) {
      const relative = options.target
      if (relative === undefined || 'groupId' in relative || relative.direction === 'center') {
        throw new RightSidebarError('unknown-group', 'right-sidebar: target group is unavailable')
      }
      const source = groupContaining(root, relative.fromInstanceId)
      if (source === undefined) this.#throwUnknownInstance(sessionId, relative.fromInstanceId)
      const created = this.#newGroup(session.snapshot.defaultTabOrientation)
      groupId = created.id
      root = splitGroup(root, source.id, relative.direction, created, this.#newId('split'))
    }

    const opened: RuntimeInstance = Object.freeze({
      id: input.id,
      viewId: input.viewId,
      title: input.title,
      preview: options.preview === true,
      availability: 'ready',
      restoreDescriptor,
      onClose: input.onClose,
      onClosed: input.onClosed,
    })
    root = mapGroup(root, groupId, group => Object.freeze({
      ...group,
      instances: Object.freeze([...group.instances, opened]),
      activeInstanceId: opened.id,
    }))
    this.#write(session, { ...session.snapshot, root, activeGroupId: groupId })
    this.#ctx.layout.openDetails()
    return groupId
  }

  /** @inheritdoc */
  getInstanceGroup(sessionId: RightSidebarSessionId, id: string): string {
    this.#assertAlive()
    const session = this.#sessions.get(sessionId)
    const group = session === undefined ? undefined : groupContaining(session.snapshot.root, id)
    if (group === undefined) this.#throwUnknownInstance(sessionId, id)
    return group.id
  }

  /** @inheritdoc */
  resolveTarget(sessionId: RightSidebarSessionId, target: RightSidebarTarget): string | undefined {
    this.#assertAlive()
    const session = this.#sessions.get(sessionId)
    if (session === undefined) this.#throwUnknownInstance(sessionId, 'fromInstanceId' in target ? target.fromInstanceId : '')
    if ('groupId' in target) {
      if (findGroup(session.snapshot.root, target.groupId) === undefined) {
        throw new RightSidebarError('unknown-group', `right-sidebar: group "${target.groupId}" is unavailable`)
      }
      return target.groupId
    }
    const source = groupContaining(session.snapshot.root, target.fromInstanceId)
    if (source === undefined) this.#throwUnknownInstance(sessionId, target.fromInstanceId)
    return resolveDirectionalGroup(session.snapshot.root, source.id, target.direction)
  }

  /** @inheritdoc */
  activateInstance(sessionId: RightSidebarSessionId, id: string): void {
    this.#assertMounted(sessionId)
    const session = this.#knownSession(sessionId, id)
    const group = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    this.#activate(session, group.id, id)
    this.#ctx.layout.openDetails()
  }

  /** @inheritdoc */
  pinInstance(sessionId: RightSidebarSessionId, id: string): void {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    this.#pin(session, groupContaining(session.snapshot.root, id) as RightSidebarGroup, id)
  }

  /** @inheritdoc */
  updateInstance(sessionId: RightSidebarSessionId, id: string, update: RightSidebarInstanceUpdate): void {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    const group = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    const current = group.instances.find(instance => instance.id === id) as RuntimeInstance
    const replacesDescriptor = Object.prototype.hasOwnProperty.call(update, 'restoreDescriptor')
    const restoreDescriptor = replacesDescriptor
      ? cloneDescriptor(update.restoreDescriptor)
      : current.restoreDescriptor
    const title = update.title ?? current.title
    if (title === current.title && !replacesDescriptor) return
    this.#replaceInstance(session, group, current, Object.freeze({ ...current, title, restoreDescriptor }))
  }

  /** @inheritdoc */
  switchInstanceView(
    sessionId: RightSidebarSessionId,
    id: string,
    update: RightSidebarInstanceViewUpdate,
  ): void {
    this.#assertAlive()
    this.#assertView(update.viewId)
    const descriptor = cloneDescriptor(update.restoreDescriptor)
    const session = this.#knownSession(sessionId, id)
    const group = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    const current = group.instances.find(instance => instance.id === id) as RuntimeInstance
    this.#replaceInstance(session, group, current, Object.freeze({
      ...current,
      viewId: update.viewId,
      title: update.title ?? current.title,
      restoreDescriptor: descriptor,
      onClose: update.onClose,
      onClosed: update.onClosed,
      availability: 'ready',
    }))
  }

  /** @inheritdoc */
  async closeInstance(sessionId: RightSidebarSessionId, id: string): Promise<void> {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    const group = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    const instance = group.instances.find(current => current.id === id) as RuntimeInstance
    if (!await this.#requestClose(sessionId, instance)) return
    const currentGroup = groupContaining(session.snapshot.root, id)
    if (currentGroup === undefined || !currentGroup.instances.includes(instance)) return
    this.#removeInstance(session, currentGroup, instance, true)
  }

  /** Create the renderer face for one session occurrence. */
  createPanelFace(sessionId: RightSidebarSessionId): PanelInjected {
    const binding: PanelBinding = { sessionId }
    const session = this.#session(sessionId)
    return {
      hooks: { workbench: session.source, launchers: this.#launcherSource },
      mountWorkbench: () => this.#mount(binding),
      showLauncher: () => {
        this.#assertBinding(binding)
        const group = findGroup(session.snapshot.root, session.snapshot.activeGroupId) as RightSidebarGroup
        if (group.activeInstanceId === undefined) return
        const root = mapGroup(session.snapshot.root, group.id, current => Object.freeze({
          ...current, activeInstanceId: undefined,
        }))
        this.#write(session, { ...session.snapshot, root })
      },
      launch: async launcherId => {
        this.#assertBinding(binding)
        await this.launch(sessionId, launcherId)
      },
      activateInstance: id => {
        this.#assertBinding(binding)
        const group = groupContaining(session.snapshot.root, id)
        if (group === undefined) this.#throwUnknownInstance(sessionId, id)
        this.#activate(session, group.id, id)
      },
      activateGroup: groupId => {
        this.#assertBinding(binding)
        if (findGroup(session.snapshot.root, groupId) === undefined) {
          throw new RightSidebarError('unknown-group', `right-sidebar: group "${groupId}" is unavailable`)
        }
        if (session.snapshot.activeGroupId !== groupId) {
          this.#write(session, { ...session.snapshot, activeGroupId: groupId })
        }
      },
      pinInstance: id => {
        this.#assertBinding(binding)
        this.pinInstance(sessionId, id)
      },
      closeInstance: async id => {
        this.#assertBinding(binding)
        await this.closeInstance(sessionId, id)
      },
      retryRestore: async id => {
        this.#assertBinding(binding)
        await this.#restoreInstance(sessionId, id, true)
      },
      moveInstance: (id, target) => {
        this.#assertBinding(binding)
        this.#moveInstance(sessionId, id, target)
      },
      setGroupTabOrientation: (groupId, orientation) => {
        this.#assertBinding(binding)
        this.#updateGroup(session, groupId, group => Object.freeze({ ...group, tabOrientation: orientation }))
      },
      setGroupVerticalRailWidth: (groupId, width) => {
        this.#assertBinding(binding)
        this.#updateGroup(session, groupId, group => Object.freeze({
          ...group, verticalRailWidth: Math.max(0, width),
        }))
      },
      setDefaultTabOrientation: orientation => {
        this.#assertBinding(binding)
        if (session.snapshot.defaultTabOrientation === orientation) return
        this.#write(session, { ...session.snapshot, defaultTabOrientation: orientation })
      },
      setSplitRatio: (splitId, ratio) => {
        this.#assertBinding(binding)
        const root = mapSplit(session.snapshot.root, splitId, split => Object.freeze({
          ...split, ratio: Math.min(1, Math.max(0, ratio)),
        }))
        if (root === session.snapshot.root) {
          throw new RightSidebarError('unknown-group', `right-sidebar: split "${splitId}" is unavailable`)
        }
        this.#write(session, { ...session.snapshot, root })
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
    this.#restorers.clear()
    this.#notify(this.#launcherListeners)
    for (const session of this.#sessions.values()) this.#notify(session.listeners)
    this.#launcherListeners.clear()
    for (const session of this.#sessions.values()) session.listeners.clear()
    this.#sessions.clear()
    this.#closing.clear()
    this.#openGenerations.clear()
  }

  #resolveOpenGroup(session: SessionRecord, target: RightSidebarTarget | undefined): RightSidebarGroup | undefined {
    if (target === undefined) return findGroup(session.snapshot.root, session.snapshot.activeGroupId)
    if ('groupId' in target) {
      const group = findGroup(session.snapshot.root, target.groupId)
      if (group === undefined) {
        throw new RightSidebarError('unknown-group', `right-sidebar: group "${target.groupId}" is unavailable`)
      }
      return group
    }
    const source = groupContaining(session.snapshot.root, target.fromInstanceId)
    if (source === undefined) this.#throwUnknownInstance('', target.fromInstanceId)
    const groupId = resolveDirectionalGroup(session.snapshot.root, source.id, target.direction)
    return groupId === undefined ? undefined : findGroup(session.snapshot.root, groupId)
  }

  #assertOpenCurrent(key: string, generation: number): void {
    this.#assertAlive()
    if (this.#openGenerations.get(key) !== generation) {
      throw new RightSidebarError('superseded', 'right-sidebar: a newer open operation superseded this request')
    }
  }

  #advanceOpenGeneration(key: string): number {
    const generation = (this.#openGenerations.get(key) ?? 0) + 1
    this.#openGenerations.set(key, generation)
    return generation
  }

  async #requestClose(sessionId: RightSidebarSessionId, instance: RuntimeInstance): Promise<boolean> {
    const pending = this.#closing.get(sessionId)?.get(instance.id)
    if (pending?.instance === instance) return pending.promise
    const promise = Promise.resolve().then(async () => instance.onClose === undefined || await instance.onClose() !== false)
    const operation: ClosingOperation = { instance, promise }
    let sessionClosing = this.#closing.get(sessionId)
    if (sessionClosing === undefined) {
      sessionClosing = new Map()
      this.#closing.set(sessionId, sessionClosing)
    }
    sessionClosing.set(instance.id, operation)
    void promise.finally(() => {
      const current = this.#closing.get(sessionId)
      if (current?.get(instance.id) !== operation) return
      current.delete(instance.id)
      if (current.size === 0) this.#closing.delete(sessionId)
    }).catch(() => {})
    return promise
  }

  #removeInstance(
    session: SessionRecord,
    group: RightSidebarGroup,
    instance: RuntimeInstance,
    collapse: boolean,
  ): void {
    const index = group.instances.indexOf(instance)
    const instances = group.instances.filter(current => current !== instance)
    const activeInstanceId = group.activeInstanceId === instance.id
      ? instances[index]?.id ?? instances[index - 1]?.id
      : group.activeInstanceId
    let root = mapGroup(session.snapshot.root, group.id, current => Object.freeze({
      ...current, instances: Object.freeze(instances), activeInstanceId,
    }))
    let activeGroupId = session.snapshot.activeGroupId
    if (collapse && instances.length === 0 && groupsOf(root).length > 1) {
      root = collapseGroup(root, group.id)
      if (activeGroupId === group.id) activeGroupId = groupsOf(root)[0]?.id ?? activeGroupId
    }
    this.#write(session, { ...session.snapshot, root, activeGroupId })
    try { instance.onClosed?.() } catch (error) {
      console.error(`right-sidebar: onClosed notification failed for instance "${instance.id}":`, error)
    }
  }

  #replaceInstance(
    session: SessionRecord,
    group: RightSidebarGroup,
    current: RuntimeInstance,
    replacement: RuntimeInstance,
  ): void {
    const instances = [...group.instances]
    instances[instances.indexOf(current)] = replacement
    const root = mapGroup(session.snapshot.root, group.id, value => Object.freeze({
      ...value, instances: Object.freeze(instances),
    }))
    this.#write(session, { ...session.snapshot, root })
  }

  #pin(session: SessionRecord, group: RightSidebarGroup, id: string): void {
    const current = group.instances.find(instance => instance.id === id) as RuntimeInstance
    if (!current.preview) return
    this.#replaceInstance(session, group, current, Object.freeze({ ...current, preview: false }))
  }

  #activate(session: SessionRecord, groupId: string, id: string): void {
    const group = findGroup(session.snapshot.root, groupId)
    if (group === undefined || !group.instances.some(instance => instance.id === id)) {
      this.#throwUnknownInstance('', id)
    }
    if (session.snapshot.activeGroupId === groupId && group.activeInstanceId === id) return
    const root = mapGroup(session.snapshot.root, groupId, current => Object.freeze({
      ...current, activeInstanceId: id,
    }))
    this.#write(session, { ...session.snapshot, root, activeGroupId: groupId })
  }

  #moveInstance(sessionId: RightSidebarSessionId, id: string, target: RightSidebarMoveTarget): void {
    const session = this.#knownSession(sessionId, id)
    const source = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    const destination = findGroup(session.snapshot.root, target.groupId)
    if (destination === undefined) {
      throw new RightSidebarError('unknown-group', `right-sidebar: group "${target.groupId}" is unavailable`)
    }
    const instance = source.instances.find(current => current.id === id) as RuntimeInstance
    const moved = Object.freeze({ ...instance, preview: false })
    if (source.id === destination.id && source.instances.length === 1 && target.direction !== 'center') {
      if (moved !== instance) this.#replaceInstance(session, source, instance, moved)
      return
    }
    let root = mapGroup(session.snapshot.root, source.id, group => Object.freeze({
      ...group,
      instances: Object.freeze(group.instances.filter(current => current !== instance)),
      activeInstanceId: group.activeInstanceId === id
        ? group.instances.filter(current => current !== instance)[0]?.id
        : group.activeInstanceId,
    }))
    let activeGroupId: string
    if (target.direction === 'center') {
      const currentDestination = findGroup(root, destination.id)
      if (currentDestination === undefined) {
        throw new RightSidebarError('unknown-group', `right-sidebar: group "${destination.id}" collapsed during move`)
      }
      const instances = [...currentDestination.instances]
      const requestedIndex = target.index ?? instances.length
      const adjustedIndex = source.id === destination.id && source.instances.indexOf(instance) < requestedIndex
        ? requestedIndex - 1
        : requestedIndex
      const index = Math.min(instances.length, Math.max(0, adjustedIndex))
      instances.splice(index, 0, moved)
      root = mapGroup(root, destination.id, group => Object.freeze({
        ...group, instances: Object.freeze(instances), activeInstanceId: id,
      }))
      activeGroupId = destination.id
    } else {
      const created = this.#newGroup(session.snapshot.defaultTabOrientation, [moved], id)
      root = splitGroup(root, destination.id, target.direction, created, this.#newId('split'))
      activeGroupId = created.id
    }
    const emptied = findGroup(root, source.id)
    if (emptied?.instances.length === 0 && groupsOf(root).length > 1 && source.id !== activeGroupId) {
      root = collapseGroup(root, source.id)
    }
    this.#write(session, { ...session.snapshot, root, activeGroupId })
  }

  #updateGroup(
    session: SessionRecord,
    groupId: string,
    update: (group: RightSidebarGroup) => RightSidebarGroup,
  ): void {
    if (findGroup(session.snapshot.root, groupId) === undefined) {
      throw new RightSidebarError('unknown-group', `right-sidebar: group "${groupId}" is unavailable`)
    }
    this.#write(session, { ...session.snapshot, root: mapGroup(session.snapshot.root, groupId, update) })
  }

  #reconcileViews(): void {
    if (this.#disposed) return
    const live = new Set(this.#ctx.slots.entries('rightbar.view')
      .map(entry => entry.options.id)
      .filter((id): id is string => id !== undefined))
    for (const session of this.#sessions.values()) {
      let root = session.snapshot.root
      for (const group of groupsOf(root)) {
        const instances = group.instances.map(instance => live.has(instance.viewId)
          ? instance
          : Object.freeze({ ...(instance as RuntimeInstance), availability: 'missing' as const }))
        if (instances.some((instance, index) => instance !== group.instances[index])) {
          root = mapGroup(root, group.id, current => Object.freeze({
            ...current, instances: Object.freeze(instances),
          }))
        }
      }
      if (root !== session.snapshot.root) this.#write(session, { ...session.snapshot, root })
    }
    for (const viewId of live) void this.#restoreView(viewId)
  }

  #markViewMissing(viewId: string): void {
    for (const session of this.#sessions.values()) {
      let root = session.snapshot.root
      for (const group of groupsOf(root)) {
        const instances = group.instances.map(instance => instance.viewId === viewId
          ? Object.freeze({
            ...(instance as RuntimeInstance), availability: 'missing' as const,
            onClose: undefined, onClosed: undefined,
          })
          : instance)
        if (instances.some((instance, index) => instance !== group.instances[index])) {
          root = mapGroup(root, group.id, current => Object.freeze({
            ...current, instances: Object.freeze(instances),
          }))
        }
      }
      if (root !== session.snapshot.root) this.#write(session, { ...session.snapshot, root })
    }
  }

  async #restoreView(viewId: string): Promise<void> {
    await Promise.all([...this.#sessions.keys()].flatMap(sessionId => {
      const session = this.#sessions.get(sessionId)
      if (session === undefined) return []
      return groupsOf(session.snapshot.root).flatMap(group => group.instances
        .filter(instance => instance.viewId === viewId && instance.availability !== 'ready')
        .map(instance => this.#restoreInstance(sessionId, instance.id, false)))
    }))
  }

  async #restoreInstance(sessionId: RightSidebarSessionId, id: string, retry: boolean): Promise<void> {
    this.#assertAlive()
    const session = this.#knownSession(sessionId, id)
    const group = groupContaining(session.snapshot.root, id) as RightSidebarGroup
    const instance = group.instances.find(current => current.id === id) as RuntimeInstance
    if (instance.availability === 'ready' || (!retry && instance.availability === 'restoring')) return
    const restorer = this.#restorers.get(instance.viewId)
    if (restorer === undefined || !this.#isViewLive(instance.viewId) || instance.restoreDescriptor === undefined) {
      if (instance.availability !== 'missing') {
        this.#replaceInstance(session, group, instance, Object.freeze({ ...instance, availability: 'missing' }))
      }
      return
    }
    const restoring = Object.freeze({ ...instance, availability: 'restoring' as const })
    this.#replaceInstance(session, group, instance, restoring)
    try {
      const result = await restorer({
        sessionId,
        instanceId: instance.id,
        descriptor: instance.restoreDescriptor,
      })
      if (this.#disposed || this.#restorers.get(instance.viewId) !== restorer) return
      const currentGroup = groupContaining(session.snapshot.root, id)
      const current = currentGroup?.instances.find(candidate => candidate.id === id)
      if (currentGroup === undefined || current !== restoring) return
      this.#replaceInstance(session, currentGroup, restoring, Object.freeze({
        ...restoring, availability: 'ready', onClose: result?.onClose, onClosed: result?.onClosed,
      }))
    } catch {
      if (this.#disposed) return
      const currentGroup = groupContaining(session.snapshot.root, id)
      const current = currentGroup?.instances.find(candidate => candidate.id === id)
      if (currentGroup !== undefined && current === restoring) {
        this.#replaceInstance(session, currentGroup, restoring, Object.freeze({
          ...restoring, availability: 'failed',
        }))
      }
    }
  }

  #isViewLive(viewId: string): boolean {
    return this.#ctx.slots.entries('rightbar.view').some(entry => entry.options.id === viewId)
  }

  #assertView(viewId: string): void {
    if (!this.#isViewLive(viewId)) {
      throw new RightSidebarError('unknown-view', `right-sidebar: view "${viewId}" is not registered`)
    }
  }

  #mount(binding: PanelBinding): () => void {
    this.#assertAlive()
    this.#binding = binding
    return () => { if (this.#binding === binding) this.#binding = undefined }
  }

  #assertBinding(binding: PanelBinding): void {
    this.#assertAlive()
    if (this.#binding !== binding) {
      throw new RightSidebarError('not-mounted', 'right-sidebar: renderer binding is not mounted')
    }
  }

  #assertMounted(sessionId: RightSidebarSessionId): void {
    this.#assertAlive()
    if (this.#binding === undefined) {
      throw new RightSidebarError('not-mounted', 'right-sidebar: no details panel is mounted')
    }
    if (this.#binding.sessionId !== sessionId) {
      throw new RightSidebarError(
        'session-mismatch',
        `right-sidebar: mounted session "${String(this.#binding.sessionId)}" does not match "${String(sessionId)}"`,
      )
    }
  }

  #assertAlive(): void {
    if (this.#disposed) throw new RightSidebarError('disposed', 'right-sidebar: client runtime is disposed')
  }

  #knownSession(sessionId: RightSidebarSessionId, instanceId: string): SessionRecord {
    const session = this.#sessions.get(sessionId)
    if (session === undefined || groupContaining(session.snapshot.root, instanceId) === undefined) {
      this.#throwUnknownInstance(sessionId, instanceId)
    }
    return session
  }

  #throwUnknownInstance(sessionId: RightSidebarSessionId | '', instanceId: string): never {
    throw new RightSidebarError(
      'unknown-instance',
      `right-sidebar: instance "${instanceId}" is not open for session "${String(sessionId)}"`,
    )
  }

  #session(sessionId: RightSidebarSessionId): SessionRecord {
    const existing = this.#sessions.get(sessionId)
    if (existing !== undefined) return existing
    const restored = this.#persisted[String(sessionId)]
    const snapshot = restored === undefined ? this.#newWorkbench() : hydrateWorkbench(restored)
    this.#reserveIdentities(snapshot.root)
    const listeners = new Set<() => void>()
    const record: SessionRecord = {
      snapshot,
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
    for (const viewId of this.#restorers.keys()) void this.#restoreView(viewId)
    return record
  }

  #newWorkbench(): RightSidebarWorkbench {
    const group = this.#newGroup('horizontal')
    return Object.freeze({ root: group, activeGroupId: group.id, defaultTabOrientation: 'horizontal' })
  }

  #newGroup(
    orientation: RightSidebarTabOrientation,
    instances: readonly RightSidebarInstance[] = [],
    activeInstanceId?: string,
  ): RightSidebarGroup {
    return Object.freeze({
      kind: 'group',
      id: this.#newId('group'),
      tabOrientation: orientation,
      verticalRailWidth: DEFAULT_RAIL_WIDTH,
      instances: Object.freeze([...instances]),
      activeInstanceId,
    })
  }

  #newId(prefix: 'group' | 'split'): string {
    return `${prefix}-${this.#nextIdentity++}`
  }

  #reserveIdentities(root: RightSidebarLayoutNode): void {
    const visit = (node: RightSidebarLayoutNode): void => {
      const match = /-(\d+)$/.exec(node.id)
      if (match !== null) this.#nextIdentity = Math.max(this.#nextIdentity, Number(match[1]) + 1)
      if (node.kind === 'split') { visit(node.first); visit(node.second) }
    }
    visit(root)
  }

  #write(session: SessionRecord, snapshot: RightSidebarWorkbench): void {
    session.snapshot = Object.freeze(snapshot)
    this.#persisted[this.#sessionKey(session)] = persistWorkbench(snapshot)
    writePersisted(this.#persisted)
    this.#notify(session.listeners)
  }

  #sessionKey(record: SessionRecord): string {
    for (const [sessionId, candidate] of this.#sessions) {
      if (candidate === record) return String(sessionId)
    }
    throw new Error('right-sidebar: session record is not registered')
  }

  #notify(listeners: ReadonlySet<() => void>): void {
    for (const listener of [...listeners]) {
      try { listener() } catch (error) { console.error('right-sidebar: workbench subscriber failed:', error) }
    }
  }
}

function targetKey(target: RightSidebarTarget | undefined, activeGroupId: string): string {
  if (target === undefined) return `group:${activeGroupId}`
  return 'groupId' in target
    ? `group:${target.groupId}`
    : `instance:${target.fromInstanceId}:${target.direction}`
}

function cloneDescriptor(value: unknown): unknown {
  if (value === undefined) return undefined
  try {
    const encoded = JSON.stringify(value)
    if (encoded === undefined) throw new Error('not JSON data')
    return JSON.parse(encoded) as unknown
  } catch {
    throw new RightSidebarError(
      'invalid-restore-descriptor',
      'right-sidebar: restoreDescriptor must be JSON-safe data',
    )
  }
}

function persistWorkbench(workbench: RightSidebarWorkbench): PersistedWorkbench {
  const persistNode = (node: RightSidebarLayoutNode): PersistedNode => {
    if (node.kind === 'split') {
      return {
        kind: 'split', id: node.id, axis: node.axis, ratio: node.ratio,
        first: persistNode(node.first), second: persistNode(node.second),
      }
    }
    return {
      kind: 'group',
      id: node.id,
      tabOrientation: node.tabOrientation,
      verticalRailWidth: node.verticalRailWidth,
      instances: node.instances.map(value => {
        const instance = value as RuntimeInstance
        return {
          id: instance.id,
          viewId: instance.viewId,
          title: instance.title,
          preview: instance.preview,
          ...(instance.restoreDescriptor === undefined ? {} : { restoreDescriptor: instance.restoreDescriptor }),
        }
      }),
      ...(node.activeInstanceId === undefined ? {} : { activeInstanceId: node.activeInstanceId }),
    }
  }
  return {
    root: persistNode(workbench.root),
    activeGroupId: workbench.activeGroupId,
    defaultTabOrientation: workbench.defaultTabOrientation,
  }
}

function hydrateWorkbench(value: PersistedWorkbench): RightSidebarWorkbench {
  const hydrateNode = (node: PersistedNode): RightSidebarLayoutNode => {
    if (node.kind === 'split') {
      return Object.freeze({ ...node, first: hydrateNode(node.first), second: hydrateNode(node.second) })
    }
    return Object.freeze({
      ...node,
      activeInstanceId: node.activeInstanceId,
      instances: Object.freeze(node.instances.map(instance => Object.freeze({
        ...instance, availability: 'missing' as const,
      }))),
    })
  }
  return Object.freeze({ ...value, root: hydrateNode(value.root) })
}

function readPersisted(): Record<string, PersistedWorkbench> {
  let raw: string | null | undefined
  try {
    raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (raw === null || raw === undefined) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!isPersistedPayload(parsed)) throw new Error('invalid persisted workbench')
    return { ...parsed.sessions }
  } catch (error) {
    if (raw !== null && raw !== undefined) {
      try { globalThis.localStorage?.setItem(INVALID_STORAGE_KEY, raw) } catch {
        // The primary value remains untouched when storage also refuses the recovery copy.
      }
    }
    console.error(`right-sidebar: persisted workbench was rejected; original retained at ${INVALID_STORAGE_KEY}:`, error)
    return {}
  }
}

function writePersisted(sessions: Readonly<Record<string, PersistedWorkbench>>): void {
  try {
    const payload: PersistedPayload = { version: 1, sessions }
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch (error) {
    console.error('right-sidebar: persisted workbench could not be written:', error)
  }
}

function isPersistedPayload(value: unknown): value is PersistedPayload {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.sessions)) return false
  return Object.values(value.sessions).every(isPersistedWorkbench)
}

function isPersistedWorkbench(value: unknown): value is PersistedWorkbench {
  if (!isRecord(value)
    || !isNode(value.root)
    || typeof value.activeGroupId !== 'string'
    || !isOrientation(value.defaultTabOrientation)) return false
  const groups = persistedGroups(value.root)
  const nodeIds = persistedNodeIds(value.root)
  const instanceIds = groups.flatMap(group => group.instances.map(instance => instance.id))
  return groups.some(group => group.id === value.activeGroupId)
    && new Set(nodeIds).size === nodeIds.length
    && new Set(instanceIds).size === instanceIds.length
    && groups.every(group => group.instances.filter(instance => instance.preview).length <= 1)
}

function persistedGroups(root: PersistedNode): readonly PersistedGroup[] {
  return root.kind === 'group'
    ? [root]
    : [...persistedGroups(root.first), ...persistedGroups(root.second)]
}

function persistedNodeIds(root: PersistedNode): readonly string[] {
  return root.kind === 'group'
    ? [root.id]
    : [root.id, ...persistedNodeIds(root.first), ...persistedNodeIds(root.second)]
}

function isNode(value: unknown): value is PersistedNode {
  if (!isRecord(value) || typeof value.id !== 'string') return false
  if (value.kind === 'split') {
    return (value.axis === 'horizontal' || value.axis === 'vertical')
      && typeof value.ratio === 'number' && Number.isFinite(value.ratio)
      && value.ratio >= 0 && value.ratio <= 1
      && isNode(value.first) && isNode(value.second)
  }
  if (value.kind !== 'group') return false
  if (!isOrientation(value.tabOrientation)
    || typeof value.verticalRailWidth !== 'number'
    || !Number.isFinite(value.verticalRailWidth)
    || value.verticalRailWidth < 0
    || !Array.isArray(value.instances)
    || !value.instances.every(isPersistedInstance)) return false
  return value.activeInstanceId === undefined
    || (typeof value.activeInstanceId === 'string'
      && value.instances.some(instance => instance.id === value.activeInstanceId))
}

function isPersistedInstance(value: unknown): value is PersistedInstance {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.viewId === 'string'
    && typeof value.title === 'string'
    && typeof value.preview === 'boolean'
}

function isOrientation(value: unknown): value is RightSidebarTabOrientation {
  return value === 'horizontal' || value === 'vertical'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
