/**
 * The right-sidebar column panel: tab bar + active tab body. Reads the tab
 * ledger through the framework-bound injected Hook and renders the active
 * entry via `only: <id>`.
 */
import { Suspense, useEffect, useId, useRef } from 'react'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { createRightSidebarStore } from './stores'
import type { PanelInjected } from './contract'
import { SidebarContentBoundary } from './SidebarContentBoundary'

/** Full composed props: runtime share + tab render share + store + injected face + locale. */
export type RightSidebarPanelProps =
  & PropsRuntime<'details'>
  & PropsRenderSlots<'rightbar.tab'>
  & PropsStore<ReturnType<typeof createRightSidebarStore>>
  & InjectFace<PanelInjected>
  & PropsLocale<'right-sidebar'>

export function RightSidebarPanel({
  useStore, actions, renderSlot, useTabs, mountOpenTabApi, t,
}: RightSidebarPanelProps) {
  const activeTab = useStore(s => s.activeTab)
  const tabList = useTabs(rows => rows)
  const selected = tabList.find(tab => tab.id === activeTab) ?? tabList[0]
  const tabsId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => mountOpenTabApi(), [mountOpenTabApi])

  // Repair selection when the active contribution unloads. The rendered
  // fallback is immediate; this write keeps other consumers of the same
  // session store on the same tab id.
  useEffect(() => {
    const next = selected?.id ?? ''
    if (next !== activeTab) {
      actions.setActiveTab(next)
      if (activeTab !== '') {
        tabRefs.current[tabList.findIndex(tab => tab.id === next)]?.focus()
      }
    }
  }, [actions, activeTab, selected?.id])

  return (
    <div className="dsh-rightbar-root">
      {tabList.length > 0 && (
        <nav className="dsh-rightbar-tabbar" role="tablist" aria-label={t('title')}>
          {tabList.map((tab, index) => (
            <button
              key={tab.id}
              ref={(element) => { tabRefs.current[index] = element }}
              id={`${tabsId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={tab.id === selected?.id}
              aria-controls={tab.id === selected?.id ? `${tabsId}-panel-${tab.id}` : undefined}
              tabIndex={tab.id === selected?.id ? 0 : -1}
              className="dsh-rightbar-tab"
              data-active={tab.id === selected?.id ? 'true' : undefined}
              onClick={() => { actions.setActiveTab(tab.id) }}
              onKeyDown={(event) => {
                let nextIndex: number
                switch (event.key) {
                  case 'ArrowRight': nextIndex = (index + 1) % tabList.length; break
                  case 'ArrowLeft': nextIndex = (index - 1 + tabList.length) % tabList.length; break
                  case 'Home': nextIndex = 0; break
                  case 'End': nextIndex = tabList.length - 1; break
                  default: return
                }
                event.preventDefault()
                const next = tabList[nextIndex]
                if (next === undefined) return
                actions.setActiveTab(next.id)
                tabRefs.current[nextIndex]?.focus()
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}
      <div
        id={selected === undefined ? undefined : `${tabsId}-panel-${selected.id}`}
        role={selected === undefined ? undefined : 'tabpanel'}
        aria-labelledby={selected === undefined ? undefined : `${tabsId}-tab-${selected.id}`}
        className="dsh-rightbar-body"
      >
        {selected === undefined
          ? null
          : (
            <SidebarContentBoundary
              resetKey={selected.id}
              fallback={retry => (
                <div className="dsh-rightbar-state" role="alert">
                  <span>{t('failed')}</span>
                  <button type="button" className="dsh-rightbar-retry" onClick={retry}>{t('retry')}</button>
                </div>
              )}
            >
              <Suspense fallback={<div className="dsh-rightbar-state" role="status">{t('loading')}</div>}>
                {renderSlot('rightbar.tab', {}, {
                  only: selected.id,
                  fallback: null,
                })}
              </Suspense>
            </SidebarContentBoundary>
          )}
      </div>
    </div>
  )
}
