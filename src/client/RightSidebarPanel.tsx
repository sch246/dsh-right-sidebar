/** Grouped workbench chrome, drag docking, resize controls, and active renderers. */
import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {
  PanelInjected,
  RightSidebarDirection,
  RightSidebarGroup,
  RightSidebarInstance,
  RightSidebarLauncherEntry,
  RightSidebarMoveTarget,
  RightSidebarTabOrientation,
} from './contract'
import { dropDirection, groupsOf, layoutGeometry } from './layout'
import type { LayoutRect, SplitGeometry } from './layout'
import { SidebarContentBoundary } from './SidebarContentBoundary'

const NO_PENDING_OPERATIONS: ReadonlySet<string> = new Set()
const SIDEBAR_TAB_MIME = 'application/x-dsh-right-sidebar-instance'

type DropPreview =
  | { readonly kind: 'content'; readonly target: RightSidebarMoveTarget; readonly rect: LayoutRect }
  | { readonly kind: 'tabs'; readonly target: RightSidebarMoveTarget }

/** Full composed props for the details-column workbench. */
export type RightSidebarPanelProps =
  & PropsRuntime<'details'>
  & PropsRenderSlots<'rightbar.view'>
  & InjectFace<PanelInjected>
  & PropsLocale<'right-sidebar'>

/** Render the session's sole grouped layout and its feature views. */
export function RightSidebarPanel({
  renderSlot,
  useWorkbench,
  useLaunchers,
  mountWorkbench,
  showLauncher,
  launch,
  activateInstance,
  activateGroup,
  pinInstance,
  closeInstance,
  retryRestore,
  moveInstance,
  setGroupTabOrientation,
  setGroupVerticalRailWidth,
  setDefaultTabOrientation,
  setSplitRatio,
  t,
}: RightSidebarPanelProps) {
  const workbench = useWorkbench(snapshot => snapshot)
  const launchers = useLaunchers(rows => rows)
  const groups = groupsOf(workbench.root)
  const geometry = useMemo(() => layoutGeometry(workbench.root), [workbench.root])
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef(new Map<string, HTMLButtonElement>())
  const previousFocus = useRef<string | undefined>()
  const [pending, setPending] = useState<ReadonlySet<string>>(NO_PENDING_OPERATIONS)
  const [operationFailed, setOperationFailed] = useState(false)
  const [draggedId, setDraggedId] = useState<string>()
  const [dropPreview, setDropPreview] = useState<DropPreview>()
  const [mountedIds, setMountedIds] = useState<ReadonlySet<string>>(() => new Set(
    groups.flatMap(group => group.activeInstanceId === undefined ? [] : [group.activeInstanceId]),
  ))

  useEffect(() => mountWorkbench(), [mountWorkbench])
  useEffect(() => {
    const activeGroup = groups.find(group => group.id === workbench.activeGroupId)
    const focusId = activeGroup?.activeInstanceId
    if (focusId === undefined || focusId === previousFocus.current) return
    previousFocus.current = focusId
    tabRefs.current.get(focusId)?.focus()
  }, [groups, workbench.activeGroupId])
  useEffect(() => {
    const existing = new Set(groups.flatMap(group => group.instances.map(instance => instance.id)))
    const active = groups.flatMap(group => group.activeInstanceId === undefined ? [] : [group.activeInstanceId])
    setMountedIds(current => {
      const next = new Set([...current].filter(id => existing.has(id)))
      for (const id of active) next.add(id)
      return next.size === current.size && [...next].every(id => current.has(id)) ? current : next
    })
  }, [groups])

  const run = async (key: string, operation: () => Promise<void>): Promise<void> => {
    setPending(current => new Set(current).add(key))
    setOperationFailed(false)
    try { await operation() } catch { setOperationFailed(true) } finally {
      setPending(current => {
        if (!current.has(key)) return current
        if (current.size === 1) return NO_PENDING_OPERATIONS
        const next = new Set(current)
        next.delete(key)
        return next
      })
    }
  }

  const resolveContentDrop = (event: React.DragEvent<HTMLDivElement>): DropPreview | undefined => {
    const surface = event.target instanceof Element
      ? event.target.closest<HTMLElement>('.dsh-rightbar-surface[data-active="true"]')
      : null
    if (surface === null || !event.currentTarget.contains(surface)) return undefined
    const groupId = surface.dataset.groupId
    if (groupId === undefined) return undefined
    const content = surface.getBoundingClientRect()
    const workspace = workspaceRef.current?.getBoundingClientRect()
    if (workspace === undefined || workspace.width <= 0 || workspace.height <= 0) return undefined
    if (content.width <= 0 || content.height <= 0) return undefined
    return {
      kind: 'content',
      target: { groupId, direction: dropDirection(event.clientX, event.clientY, content) },
      rect: {
        x: (content.left - workspace.left) / workspace.width,
        y: (content.top - workspace.top) / workspace.height,
        width: content.width / workspace.width,
        height: content.height / workspace.height,
      },
    }
  }

  return (
    <div className="dsh-rightbar-root" aria-label={t('title')}>
      {operationFailed && <div className="dsh-rightbar-operation-error" role="alert">{t('operationFailed')}</div>}
      <div
        ref={workspaceRef}
        className="dsh-rightbar-workspace"
        onDragOverCapture={event => {
          if (!isSidebarTabDrag(event.dataTransfer) || isTabBarEventTarget(event.target)) return
          event.preventDefault()
          event.stopPropagation()
          setDropPreview(resolveContentDrop(event))
        }}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropPreview(undefined)
        }}
        onDropCapture={event => {
          if (!isSidebarTabDrag(event.dataTransfer) || isTabBarEventTarget(event.target)) return
          event.preventDefault()
          event.stopPropagation()
          const id = event.dataTransfer.getData(SIDEBAR_TAB_MIME) || draggedId
          const target = resolveContentDrop(event)?.target
          if (id !== undefined
            && target !== undefined
            && groups.some(group => group.instances.some(instance => instance.id === id))) {
            moveInstance(id, target)
          }
          setDraggedId(undefined)
          setDropPreview(undefined)
        }}
      >
        {groups.map(group => (
          <GroupPane
            key={group.id}
            group={group}
            rect={geometry.groups.get(group.id) as LayoutRect}
            activeGroup={group.id === workbench.activeGroupId}
            touchesTop={rectTouchesTop(geometry.groups.get(group.id) as LayoutRect)}
            touchesRight={rectTouchesRight(geometry.groups.get(group.id) as LayoutRect)}
            groups={groups}
            launchers={launchers}
            pending={pending}
            draggedId={draggedId}
            insertionIndex={dropPreview?.kind === 'tabs' && dropPreview.target.groupId === group.id
              ? dropPreview.target.index : undefined}
            t={t}
            setTabRef={(id, element) => {
              if (element === null) tabRefs.current.delete(id)
              else tabRefs.current.set(id, element)
            }}
            onActivateGroup={() => { activateGroup(group.id) }}
            onShowLauncher={() => {
              activateGroup(group.id)
              setOperationFailed(false)
              showLauncher()
            }}
            onActivate={activateInstance}
            onPin={pinInstance}
            onClose={id => { void run(`close:${id}`, () => closeInstance(id)) }}
            onRetry={id => { void run(`restore:${id}`, () => retryRestore(id)) }}
            onLaunch={id => { void run(`launch:${id}`, () => launch(id)) }}
            onOrientation={orientation => { setGroupTabOrientation(group.id, orientation) }}
            onRailResize={width => { setGroupVerticalRailWidth(group.id, width) }}
            onDragStart={setDraggedId}
            onDragEnd={() => { setDraggedId(undefined); setDropPreview(undefined) }}
            onDropTarget={target => { setDropPreview(target === undefined ? undefined : { kind: 'tabs', target }) }}
            onMove={moveInstance}
          />
        ))}
        {[...mountedIds].map(id => {
          const owner = groups.find(group => group.instances.some(instance => instance.id === id))
          const instance = owner?.instances.find(candidate => candidate.id === id)
          const rect = owner === undefined ? undefined : geometry.groups.get(owner.id)
          if (owner === undefined || instance === undefined || rect === undefined) return null
          const active = owner.activeInstanceId === id
          return (
            <div
              key={id}
              className="dsh-rightbar-surface"
              data-group-id={owner.id}
              data-active={active ? 'true' : undefined}
              style={surfaceStyle(rect, owner, rectTouchesTop(rect), rectTouchesRight(rect))}
              onPointerDown={() => { activateGroup(owner.id) }}
            >
              <InstanceContent
                instance={instance}
                panelId={`rightbar-panel-${safeId(id)}`}
                tabId={`rightbar-tab-${safeId(id)}`}
                renderSlot={renderSlot}
                t={t}
                onRetry={value => { void run(`restore:${value}`, () => retryRestore(value)) }}
              />
            </div>
          )
        })}
        {groups.map(group => {
          const rect = geometry.groups.get(group.id)
          if (rect === undefined || group.activeInstanceId !== undefined) return null
          return (
            <div
              key={`launcher:${group.id}`}
              className="dsh-rightbar-surface"
              data-group-id={group.id}
              data-active="true"
              style={surfaceStyle(rect, group, rectTouchesTop(rect), rectTouchesRight(rect))}
              onPointerDown={() => { activateGroup(group.id) }}
            >
              <LauncherHome
                launchers={launchers}
                pending={pending}
                defaultOrientation={workbench.defaultTabOrientation}
                onLaunch={id => { void run(`launch:${id}`, () => launch(id)) }}
                onDefaultOrientation={setDefaultTabOrientation}
                t={t}
              />
            </div>
          )
        })}
        {dropPreview?.kind === 'content' && (
          <div
            className="dsh-rightbar-drop-preview"
            style={workspaceDropStyle(dropPreview.rect, dropPreview.target.direction)}
          />
        )}
        {geometry.splits.map(split => (
          <SplitHandle
            key={split.id}
            split={split}
            workspaceRef={workspaceRef}
            label={t('resizeGroups')}
            onRatio={ratio => { setSplitRatio(split.id, ratio) }}
          />
        ))}
      </div>
    </div>
  )
}

interface GroupPaneProps {
  readonly group: RightSidebarGroup
  readonly rect: LayoutRect
  readonly activeGroup: boolean
  readonly touchesTop: boolean
  readonly touchesRight: boolean
  readonly groups: readonly RightSidebarGroup[]
  readonly launchers: readonly RightSidebarLauncherEntry[]
  readonly pending: ReadonlySet<string>
  readonly draggedId?: string
  readonly insertionIndex?: number
  readonly t: RightSidebarPanelProps['t']
  readonly setTabRef: (id: string, element: HTMLButtonElement | null) => void
  readonly onActivateGroup: () => void
  readonly onShowLauncher: () => void
  readonly onActivate: (id: string) => void
  readonly onPin: (id: string) => void
  readonly onClose: (id: string) => void
  readonly onRetry: (id: string) => void
  readonly onLaunch: (id: string) => void
  readonly onOrientation: (orientation: RightSidebarTabOrientation) => void
  readonly onRailResize: (width: number) => void
  readonly onDragStart: (id: string) => void
  readonly onDragEnd: () => void
  readonly onDropTarget: (target: RightSidebarMoveTarget | undefined) => void
  readonly onMove: (id: string, target: RightSidebarMoveTarget) => void
}

function GroupPane(props: GroupPaneProps) {
  const {
    group, rect, activeGroup, touchesTop, touchesRight, draggedId, t,
    onActivateGroup, onShowLauncher, onOrientation, onRailResize, onDropTarget,
  } = props
  const groupRef = useRef<HTMLDivElement | null>(null)
  const tabScrollRef = useRef<HTMLDivElement | null>(null)
  const style = normalizedStyle(rect)

  useEffect(() => {
    const list = tabScrollRef.current
    if (list === null || group.tabOrientation !== 'horizontal') return
    const scroll = (event: WheelEvent): void => {
      if (event.ctrlKey) return
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? Number.parseFloat(getComputedStyle(list).fontSize)
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? list.clientWidth : 1
      const before = list.scrollLeft
      list.scrollLeft = Math.max(0, Math.min(list.scrollWidth - list.clientWidth, before + delta * unit))
      if (list.scrollLeft === before) return
      event.preventDefault()
      event.stopPropagation()
    }
    // Native non-passive delivery lets consumed wheel movement cancel page scrolling.
    list.addEventListener('wheel', scroll, { passive: false })
    return () => { list.removeEventListener('wheel', scroll) }
  }, [group.tabOrientation])

  const insertionTarget = (event: React.DragEvent<HTMLDivElement>): RightSidebarMoveTarget => {
    const tabs = tabScrollRef.current?.querySelectorAll<HTMLElement>('.dsh-rightbar-tab') ?? []
    const horizontal = group.tabOrientation === 'horizontal'
    const point = horizontal ? event.clientX : event.clientY
    const index = [...tabs].findIndex(tab => {
      const bounds = tab.getBoundingClientRect()
      return point < (horizontal ? bounds.left + bounds.width / 2 : bounds.top + bounds.height / 2)
    })
    return { groupId: group.id, direction: 'center', index: index < 0 ? group.instances.length : index }
  }

  return (
    <section
      ref={groupRef}
      className="dsh-rightbar-group"
      data-active={activeGroup ? 'true' : undefined}
      data-orientation={group.tabOrientation}
      data-top={touchesTop ? 'true' : undefined}
      data-right={touchesRight ? 'true' : undefined}
      style={style}
      onPointerDown={onActivateGroup}
    >
      <div className="dsh-rightbar-group-layout">
        <div
          className="dsh-rightbar-tabs"
          style={group.tabOrientation === 'vertical'
            ? { width: `min(${group.verticalRailWidth}px, calc(100% - 32px))` }
            : undefined}
          onDragOver={event => {
            if (!isSidebarTabDrag(event.dataTransfer)) return
            event.preventDefault()
            event.stopPropagation()
            if (tabScrollRef.current !== null) autoScrollTabs(tabScrollRef.current, event, group.tabOrientation)
            onDropTarget(insertionTarget(event))
          }}
          onDrop={event => {
            if (!isSidebarTabDrag(event.dataTransfer)) return
            event.preventDefault()
            event.stopPropagation()
            const dragged = event.dataTransfer.getData(SIDEBAR_TAB_MIME) || draggedId
            if (dragged !== undefined && props.groups.some(candidate => candidate.instances.some(instance => instance.id === dragged))) {
              props.onMove(dragged, insertionTarget(event))
            }
            props.onDragEnd()
          }}
        >
          <div
            ref={tabScrollRef}
            className="dsh-rightbar-tabscroll"
            role="tablist"
            aria-orientation={group.tabOrientation}
          >
            {group.instances.length === 0 && props.insertionIndex === 0 && (
              <div className="dsh-rightbar-tab-insertion" aria-hidden />
            )}
            {group.instances.map((instance, index) => (
              <InstanceTab
                key={instance.id}
                {...props}
                instance={instance}
                index={index}
                active={instance.id === group.activeInstanceId}
                tabId={`rightbar-tab-${safeId(instance.id)}`}
                panelId={`rightbar-panel-${safeId(instance.id)}`}
              />
            ))}
          </div>
          <div className="dsh-rightbar-group-actions">
            <button
              type="button"
              className="dsh-rightbar-launcher-toggle"
              aria-label={t('openLauncher')}
              title={t('openLauncher')}
              onClick={onShowLauncher}
            >
              <span aria-hidden>+</span>
            </button>
            <button
              type="button"
              className="dsh-rightbar-orientation"
              aria-label={t(group.tabOrientation === 'horizontal' ? 'useVerticalTabs' : 'useHorizontalTabs')}
              title={t(group.tabOrientation === 'horizontal' ? 'useVerticalTabs' : 'useHorizontalTabs')}
              onClick={() => { onOrientation(group.tabOrientation === 'horizontal' ? 'vertical' : 'horizontal') }}
            >
              <OrientationIcon orientation={group.tabOrientation} />
            </button>
          </div>
        </div>
        {group.tabOrientation === 'vertical' && (
          <RailHandle
            groupRef={groupRef}
            width={group.verticalRailWidth}
            label={t('resizeTabRail')}
            onWidth={onRailResize}
          />
        )}
        <div className="dsh-rightbar-group-body">
          {group.tabOrientation === 'vertical' && group.verticalRailWidth < 72 && (
            <button
              type="button"
              className="dsh-rightbar-rail-recover"
              onClick={() => { onRailResize(180) }}
            >
              {t('restoreTabRail')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

interface InstanceTabProps extends GroupPaneProps {
  readonly instance: RightSidebarInstance
  readonly index: number
  readonly active: boolean
  readonly tabId: string
  readonly panelId: string
}

function InstanceTab(props: InstanceTabProps) {
  const { group, instance, index, active, tabId, panelId, pending, t } = props
  const moveFocus = (key: string): void => {
    const forward = group.tabOrientation === 'horizontal' ? key === 'ArrowRight' : key === 'ArrowDown'
    const backward = group.tabOrientation === 'horizontal' ? key === 'ArrowLeft' : key === 'ArrowUp'
    const nextIndex = key === 'Home' ? 0
      : key === 'End' ? group.instances.length - 1
        : forward ? (index + 1) % group.instances.length
          : backward ? (index - 1 + group.instances.length) % group.instances.length
            : undefined
    if (nextIndex === undefined) return
    const next = group.instances[nextIndex]
    if (next !== undefined) props.onActivate(next.id)
  }
  return (
    <div
      className="dsh-rightbar-tab"
      data-active={active ? 'true' : undefined}
      data-preview={instance.preview ? 'true' : undefined}
      draggable
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData(SIDEBAR_TAB_MIME, instance.id)
        props.onDragStart(instance.id)
      }}
      onDragEnd={props.onDragEnd}
    >
      {(props.insertionIndex === index || (props.insertionIndex === group.instances.length && index === group.instances.length - 1)) && (
        <div className="dsh-rightbar-tab-insertion" data-end={props.insertionIndex === group.instances.length ? 'true' : undefined} aria-hidden />
      )}
      <button
        ref={element => { props.setTabRef(instance.id, element) }}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={active ? panelId : undefined}
        tabIndex={active ? 0 : -1}
        className="dsh-rightbar-tab-label"
        title={instance.title}
        onClick={() => { props.onActivate(instance.id) }}
        onDoubleClick={() => { props.onPin(instance.id) }}
        onKeyDown={event => {
          if (event.altKey && event.shiftKey) {
            const direction: RightSidebarDirection | undefined = event.key === 'ArrowLeft' ? 'left'
              : event.key === 'ArrowRight' ? 'right'
                : event.key === 'ArrowUp' ? 'up'
                  : event.key === 'ArrowDown' ? 'down'
                    : undefined
            if (direction !== undefined) {
              event.preventDefault()
              props.onMove(instance.id, { groupId: group.id, direction })
            }
            return
          }
          if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          moveFocus(event.key)
        }}
      >
        {instance.title}
      </button>
      <button
        type="button"
        className="dsh-rightbar-tab-close"
        aria-label={t('closeInstance', { title: instance.title })}
        title={t('closeInstance', { title: instance.title })}
        disabled={pending.has(`close:${instance.id}`)}
        onClick={() => { props.onClose(instance.id) }}
      >
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
          <path d="m3 3 6 6m0-6L3 9" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function isSidebarTabDrag(dataTransfer: DataTransfer): boolean {
  return Array.from(dataTransfer.types).includes(SIDEBAR_TAB_MIME)
}

function isTabBarEventTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('.dsh-rightbar-tabs') !== null
}

function LauncherHome({
  launchers, pending, defaultOrientation, onLaunch, onDefaultOrientation, t,
}: {
  readonly launchers: readonly RightSidebarLauncherEntry[]
  readonly pending: ReadonlySet<string>
  readonly defaultOrientation: RightSidebarTabOrientation
  readonly onLaunch: (id: string) => void
  readonly onDefaultOrientation: (orientation: RightSidebarTabOrientation) => void
  readonly t: RightSidebarPanelProps['t']
}) {
  const orientationName = useId()
  return (
    <div className="dsh-rightbar-launcher-home">
      <h2>{t('launcherTitle')}</h2>
      <div className="dsh-rightbar-launcher-list">
        {launchers.map(launcher => (
          <SidebarContentBoundary
            key={launcher.id}
            resetKey={launcher.id}
            fallback={retry => (
              <div className="dsh-rightbar-launcher-error" role="alert">
                <span>{t('operationFailed')}</span>
                <button type="button" className="dsh-rightbar-retry" onClick={retry}>{t('retry')}</button>
              </div>
            )}
          >
            <LauncherButton
              launcher={launcher}
              disabled={pending.size > 0}
              onLaunch={() => { onLaunch(launcher.id) }}
            />
          </SidebarContentBoundary>
        ))}
      </div>
      <fieldset className="dsh-rightbar-default-setting">
        <legend>{t('defaultTabOrientation')}</legend>
        {(['horizontal', 'vertical'] as const).map(orientation => (
          <label key={orientation}>
            <input
              type="radio"
              name={orientationName}
              value={orientation}
              checked={defaultOrientation === orientation}
              onChange={() => { onDefaultOrientation(orientation) }}
            />
            {t(orientation === 'horizontal' ? 'horizontalTabs' : 'verticalTabs')}
          </label>
        ))}
        <p>{t('newGroupsOnly')}</p>
      </fieldset>
    </div>
  )
}

function LauncherButton({
  launcher, disabled, onLaunch,
}: {
  readonly launcher: RightSidebarLauncherEntry
  readonly disabled: boolean
  readonly onLaunch: () => void
}) {
  const label = typeof launcher.label === 'function' ? launcher.label() : launcher.label
  return <button type="button" className="dsh-rightbar-launcher" disabled={disabled} onClick={onLaunch}>{label}</button>
}

function InstanceContent({
  instance, panelId, tabId, renderSlot, t, onRetry,
}: {
  readonly instance: RightSidebarInstance
  readonly panelId: string
  readonly tabId: string
  readonly renderSlot: RightSidebarPanelProps['renderSlot']
  readonly t: RightSidebarPanelProps['t']
  readonly onRetry: (id: string) => void
}) {
  if (instance.availability !== 'ready') {
    const key = instance.availability === 'restoring' ? 'restoringInstance'
      : instance.availability === 'failed' ? 'restoreFailed'
        : 'missingView'
    return (
      <div className="dsh-rightbar-state" role={instance.availability === 'restoring' ? 'status' : 'alert'}>
        <span>{t(key)}</span>
        {instance.availability === 'failed' && (
          <button type="button" className="dsh-rightbar-retry" onClick={() => { onRetry(instance.id) }}>{t('retry')}</button>
        )}
      </div>
    )
  }
  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} className="dsh-rightbar-view">
      <SidebarContentBoundary
        resetKey={`${instance.id}:${instance.viewId}`}
        fallback={retry => (
          <div className="dsh-rightbar-state" role="alert">
            <span>{t('failed')}</span>
            <button type="button" className="dsh-rightbar-retry" onClick={retry}>{t('retry')}</button>
          </div>
        )}
      >
        <Suspense fallback={<div className="dsh-rightbar-state" role="status">{t('loading')}</div>}>
          {renderSlot('rightbar.view', { instanceId: instance.id }, { only: instance.viewId, fallback: null })}
        </Suspense>
      </SidebarContentBoundary>
    </div>
  )
}

function SplitHandle({
  split, workspaceRef, label, onRatio,
}: {
  readonly split: SplitGeometry
  readonly workspaceRef: React.RefObject<HTMLDivElement>
  readonly label: string
  readonly onRatio: (ratio: number) => void
}) {
  const drag = useRef<{ workspace: DOMRect; pointerId: number }>()
  const begin = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    const workspace = workspaceRef.current?.getBoundingClientRect()
    if (workspace === undefined) return
    drag.current = { workspace, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: React.PointerEvent<HTMLDivElement>): void => {
    const current = drag.current
    if (current === undefined || current.pointerId !== event.pointerId) return
    const ownerLeft = current.workspace.left + split.owner.x * current.workspace.width
    const ownerTop = current.workspace.top + split.owner.y * current.workspace.height
    const ownerSize = split.axis === 'horizontal'
      ? split.owner.width * current.workspace.width
      : split.owner.height * current.workspace.height
    const point = split.axis === 'horizontal' ? event.clientX - ownerLeft : event.clientY - ownerTop
    onRatio(ownerSize <= 0 ? 0.5 : point / ownerSize)
  }
  const end = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const currentRatio = split.axis === 'horizontal'
    ? (split.x - split.owner.x) / split.owner.width
    : (split.y - split.owner.y) / split.owner.height
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={split.axis === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(currentRatio * 100)}
      className="dsh-rightbar-split-handle"
      data-axis={split.axis}
      style={splitHandleStyle(split)}
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => { drag.current = undefined }}
      onDoubleClick={() => { onRatio(0.5) }}
      onKeyDown={event => {
        if (event.key === 'Home') { event.preventDefault(); onRatio(0.5); return }
        const delta = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -0.05
          : event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 0.05
            : undefined
        if (delta === undefined) return
        event.preventDefault()
        onRatio(currentRatio + delta)
      }}
    />
  )
}

function RailHandle({
  groupRef, width, label, onWidth,
}: {
  readonly groupRef: React.RefObject<HTMLDivElement>
  readonly width: number
  readonly label: string
  readonly onWidth: (width: number) => void
}) {
  const drag = useRef<{ left: number; pointerId: number }>()
  const maximum = Math.max(width, groupRef.current?.clientWidth ?? width)
  const begin = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault()
    event.stopPropagation()
    const rect = groupRef.current?.getBoundingClientRect()
    if (rect === undefined) return
    drag.current = { left: rect.left, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (drag.current?.pointerId !== event.pointerId) return
    onWidth(event.clientX - drag.current.left)
  }
  const end = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = undefined
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={Math.round(maximum)}
      aria-valuenow={Math.round(width)}
      className="dsh-rightbar-rail-handle"
      onPointerDown={begin}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={() => { drag.current = undefined }}
      onDoubleClick={() => { onWidth(180) }}
      onKeyDown={event => {
        if (event.key === 'Home') { event.preventDefault(); onWidth(180) }
        else if (event.key === 'End') { event.preventDefault(); onWidth(0) }
        else if (event.key === 'ArrowLeft') { event.preventDefault(); onWidth(Math.max(0, width - 16)) }
        else if (event.key === 'ArrowRight') { event.preventDefault(); onWidth(width + 16) }
      }}
    />
  )
}

function OrientationIcon({ orientation }: { readonly orientation: RightSidebarTabOrientation }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden>
      <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      {orientation === 'horizontal'
        ? <path d="M2.75 6h10.5M6.25 2.75V6" stroke="currentColor" strokeWidth="1.25" />
        : <path d="M6 2.75v10.5M2.75 6.25H6" stroke="currentColor" strokeWidth="1.25" />}
    </svg>
  )
}

function normalizedStyle(rect: LayoutRect): React.CSSProperties {
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
  }
}

function surfaceStyle(
  rect: LayoutRect,
  group: RightSidebarGroup,
  touchesTop: boolean,
  touchesRight: boolean,
): React.CSSProperties {
  if (group.tabOrientation === 'horizontal') {
    const header = touchesTop ? 56 : 34
    return {
      left: `${rect.x * 100}%`,
      top: `calc(${rect.y * 100}% + ${header + 2}px)`,
      width: `${rect.width * 100}%`,
      height: `calc(${rect.height * 100}% - ${header + 2}px)`,
    }
  }
  const rail = `min(${group.verticalRailWidth}px, calc(${rect.width * 100}% - 32px))`
  const clearance = touchesTop && touchesRight ? 56 : 0
  return {
    left: `calc(${rect.x * 100}% + ${rail})`,
    top: `calc(${rect.y * 100}% + ${clearance}px)`,
    width: `calc(${rect.width * 100}% - ${rail})`,
    height: `calc(${rect.height * 100}% - ${clearance}px)`,
  }
}

function workspaceDropStyle(rect: LayoutRect, direction: RightSidebarDirection): React.CSSProperties {
  const halfWidth = direction === 'left' || direction === 'right' ? rect.width / 2 : rect.width
  const halfHeight = direction === 'up' || direction === 'down' ? rect.height / 2 : rect.height
  const x = direction === 'right' ? rect.x + rect.width / 2 : rect.x
  const y = direction === 'down' ? rect.y + rect.height / 2 : rect.y
  return normalizedStyle({ x, y, width: halfWidth, height: halfHeight })
}

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, character => `-${character.codePointAt(0)?.toString(16) ?? '0'}-`)
}

function rectTouchesTop(rect: LayoutRect): boolean {
  return rect.y <= Number.EPSILON
}

function rectTouchesRight(rect: LayoutRect): boolean {
  return rect.x + rect.width >= 1 - Number.EPSILON
}

function splitHandleStyle(split: SplitGeometry): React.CSSProperties {
  return split.axis === 'horizontal'
    ? { left: `${split.x * 100}%`, top: `${split.y * 100}%`, height: `${split.height * 100}%` }
    : { left: `${split.x * 100}%`, top: `${split.y * 100}%`, width: `${split.width * 100}%` }
}

function autoScrollTabs(
  list: HTMLDivElement,
  event: React.DragEvent<HTMLDivElement>,
  orientation: RightSidebarTabOrientation,
): void {
  const rect = list.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return
  const point = orientation === 'horizontal' ? event.clientX : event.clientY
  const start = orientation === 'horizontal' ? rect.left : rect.top
  const end = orientation === 'horizontal' ? rect.right : rect.bottom
  const delta = point - start < 24 ? -24 : end - point < 24 ? 24 : 0
  if (delta === 0) return
  list.scrollBy(orientation === 'horizontal' ? { left: delta } : { top: delta })
}
