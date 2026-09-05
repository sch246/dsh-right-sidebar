/** Launcher home, instance tabs, and active static view renderer. */
import { Suspense, useEffect, useId, useRef, useState } from 'react'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { PanelInjected, RightSidebarInstance, RightSidebarLauncherEntry } from './contract'
import { SidebarContentBoundary } from './SidebarContentBoundary'

const NO_PENDING_OPERATIONS: ReadonlySet<string> = new Set()

/** Full composed props for the details-column workbench. */
export type RightSidebarPanelProps =
  & PropsRuntime<'details'>
  & PropsRenderSlots<'rightbar.view'>
  & InjectFace<PanelInjected>
  & PropsLocale<'right-sidebar'>

/**
 * Render the launcher home, retained instance tabs, and active feature view.
 * @param props - Framework runtime shares and the runtime-owned panel face.
 * @returns The details-column workbench.
 */
export function RightSidebarPanel({
  renderSlot,
  useWorkbench,
  useLaunchers,
  mountWorkbench,
  showLauncher,
  launch,
  activateInstance,
  closeInstance,
  t,
}: RightSidebarPanelProps) {
  const workbench = useWorkbench(snapshot => snapshot)
  const launchers = useLaunchers(rows => rows)
  const active = workbench.instances.find(row => row.id === workbench.activeInstanceId)
  const tabsId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const launcherRef = useRef<HTMLButtonElement | null>(null)
  const previousActive = useRef<string | undefined>(workbench.activeInstanceId)
  const [pending, setPending] = useState<ReadonlySet<string>>(NO_PENDING_OPERATIONS)
  const [operationFailed, setOperationFailed] = useState(false)

  useEffect(() => mountWorkbench(), [mountWorkbench])
  useEffect(() => {
    if (previousActive.current === workbench.activeInstanceId) return
    previousActive.current = workbench.activeInstanceId
    if (workbench.activeInstanceId === undefined) launcherRef.current?.focus()
    else tabRefs.current[workbench.instances.findIndex(row => row.id === workbench.activeInstanceId)]?.focus()
  }, [workbench.activeInstanceId, workbench.instances])

  const run = async (key: string, operation: () => Promise<void>): Promise<void> => {
    setPending(current => new Set(current).add(key))
    setOperationFailed(false)
    try {
      await operation()
    } catch {
      setOperationFailed(true)
    } finally {
      setPending(current => {
        if (!current.has(key)) return current
        if (current.size === 1) return NO_PENDING_OPERATIONS
        const next = new Set(current)
        next.delete(key)
        return next
      })
    }
  }

  const moveFocus = (index: number, key: string): void => {
    let nextIndex: number
    switch (key) {
      case 'ArrowRight': nextIndex = (index + 1) % workbench.instances.length; break
      case 'ArrowLeft': nextIndex = (index - 1 + workbench.instances.length) % workbench.instances.length; break
      case 'Home': nextIndex = 0; break
      case 'End': nextIndex = workbench.instances.length - 1; break
      default: return
    }
    const next = workbench.instances[nextIndex]
    if (next === undefined) return
    activateInstance(next.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="dsh-rightbar-root">
      <nav className="dsh-rightbar-tabbar" aria-label={t('title')}>
        <div className="dsh-rightbar-tabscroll" role="tablist">
          {workbench.instances.map((instance, index) => (
            <InstanceTab
              key={instance.id}
              instance={instance}
              active={instance.id === active?.id}
              tabId={`${tabsId}-tab-${index}`}
              panelId={`${tabsId}-panel`}
              tabRef={element => { tabRefs.current[index] = element }}
              closeLabel={t('closeInstance', { title: instance.title })}
              closePending={pending.has(`close:${instance.id}`)}
              onActivate={() => { activateInstance(instance.id) }}
              onClose={() => { void run(`close:${instance.id}`, () => closeInstance(instance.id)) }}
              onNavigate={key => { moveFocus(index, key) }}
            />
          ))}
        </div>
        <button
          ref={launcherRef}
          type="button"
          className="dsh-rightbar-launcher-toggle"
          data-active={active === undefined ? 'true' : undefined}
          aria-pressed={active === undefined}
          aria-label={t('openLauncher')}
          title={t('openLauncher')}
          onClick={() => { setOperationFailed(false); showLauncher() }}
        >
          <span aria-hidden>+</span>
        </button>
      </nav>
      {operationFailed && <div className="dsh-rightbar-operation-error" role="alert">{t('operationFailed')}</div>}
      <div
        id={active === undefined ? undefined : `${tabsId}-panel`}
        role={active === undefined ? undefined : 'tabpanel'}
        aria-labelledby={active === undefined
          ? undefined
          : `${tabsId}-tab-${workbench.instances.indexOf(active)}`}
        className="dsh-rightbar-body"
      >
        {active === undefined
          ? (
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
                      onLaunch={() => { void run(`launch:${launcher.id}`, () => launch(launcher.id)) }}
                    />
                  </SidebarContentBoundary>
                ))}
              </div>
            </div>
          )
          : (
            <SidebarContentBoundary
              resetKey={`${active.id}:${active.viewId}`}
              fallback={retry => (
                <div className="dsh-rightbar-state" role="alert">
                  <span>{t('failed')}</span>
                  <button type="button" className="dsh-rightbar-retry" onClick={retry}>{t('retry')}</button>
                </div>
              )}
            >
              <Suspense fallback={<div className="dsh-rightbar-state" role="status">{t('loading')}</div>}>
                {renderSlot('rightbar.view', { instanceId: active.id }, {
                  only: active.viewId,
                  fallback: null,
                })}
              </Suspense>
            </SidebarContentBoundary>
          )}
      </div>
    </div>
  )
}

interface LauncherButtonProps {
  readonly launcher: RightSidebarLauncherEntry
  readonly disabled: boolean
  readonly onLaunch: () => void
}

function LauncherButton({ launcher, disabled, onLaunch }: LauncherButtonProps) {
  const label = typeof launcher.label === 'function' ? launcher.label() : launcher.label
  return (
    <button
      type="button"
      className="dsh-rightbar-launcher"
      disabled={disabled}
      onClick={onLaunch}
    >
      {label}
    </button>
  )
}

interface InstanceTabProps {
  readonly instance: RightSidebarInstance
  readonly active: boolean
  readonly tabId: string
  readonly panelId: string
  readonly closeLabel: string
  readonly closePending: boolean
  readonly tabRef: (element: HTMLButtonElement | null) => void
  readonly onActivate: () => void
  readonly onClose: () => void
  readonly onNavigate: (key: string) => void
}

function InstanceTab({
  instance,
  active,
  tabId,
  panelId,
  closeLabel,
  closePending,
  tabRef,
  onActivate,
  onClose,
  onNavigate,
}: InstanceTabProps) {
  return (
    <div className="dsh-rightbar-tab" data-active={active ? 'true' : undefined}>
      <button
        ref={tabRef}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={active}
        aria-controls={active ? panelId : undefined}
        tabIndex={active ? 0 : -1}
        className="dsh-rightbar-tab-label"
        title={instance.title}
        onClick={onActivate}
        onKeyDown={event => {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return
          event.preventDefault()
          onNavigate(event.key)
        }}
      >
        {instance.title}
      </button>
      <button
        type="button"
        className="dsh-rightbar-tab-close"
        aria-label={closeLabel}
        title={closeLabel}
        disabled={closePending}
        onClick={onClose}
      >
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
          <path d="m3 3 6 6m0-6L3 9" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
