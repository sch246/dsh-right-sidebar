/**
 * The right-sidebar column panel: tab bar + active tab body + collapse
 * control. Reads the tab ledger through the framework-bound injected Hook and
 * renders the active entry via `only: <id>`.
 */
import { useEffect, useId, useRef } from 'react'
import type { InjectFace, PropsLocale, PropsRenderSlots, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { createRightSidebarStore } from './stores'
import type { PanelInjected } from './contract'

/** Full composed props: runtime share + tab render share + store + injected face + locale. */
export type RightSidebarPanelProps =
  & PropsRuntime<'details'>
  & PropsRenderSlots<'rightbar.tab'>
  & PropsStore<ReturnType<typeof createRightSidebarStore>>
  & InjectFace<PanelInjected>
  & PropsLocale<'right-sidebar'>

export function RightSidebarPanel({ useStore, actions, renderSlot, setOpen, useTabs, t }: RightSidebarPanelProps) {
  const activeTab = useStore(s => s.activeTab)
  const tabList = useTabs(rows => rows)
  const selected = tabList.find(tab => tab.id === activeTab) ?? tabList[0]
  const tabsId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Repair selection when the active contribution unloads. The rendered
  // fallback is immediate; this write keeps other consumers of the same
  // session store on the same tab id.
  useEffect(() => {
    const next = selected?.id ?? ''
    if (next !== activeTab) actions.setActiveTab(next)
  }, [actions, activeTab, selected?.id])

  return (
    <div className="dsh-rightbar-root">
      <header className="dsh-rightbar-header">
        <button
          type="button"
          className="dsh-rightbar-collapse"
          aria-label={t('collapse')}
          title={t('collapse')}
          onClick={() => { setOpen(false) }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>
        <span className="dsh-rightbar-title">{t('title')}</span>
      </header>
      <nav className="dsh-rightbar-tabbar" role="tablist" aria-label={t('title')}>
        {tabList.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element }}
            id={`${tabsId}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={tab.id === selected?.id}
            aria-controls={`${tabsId}-panel-${tab.id}`}
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
      <div
        id={selected === undefined ? undefined : `${tabsId}-panel-${selected.id}`}
        role={selected === undefined ? undefined : 'tabpanel'}
        aria-labelledby={selected === undefined ? undefined : `${tabsId}-tab-${selected.id}`}
        className="dsh-rightbar-body"
      >
        {selected === undefined
          ? <div className="dsh-rightbar-empty">{t('empty')}</div>
          : renderSlot('rightbar.tab', {}, {
            only: selected.id,
            fallback: <div className="dsh-rightbar-empty">{t('empty')}</div>,
          })}
      </div>
    </div>
  )
}
