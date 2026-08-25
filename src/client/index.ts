/**
 * @dsh-external/dsh-right-sidebar — browser half.
 *
 * Takes over the official `details` column and turns it into a tab platform:
 *
 * - declares the public `rightbar.tab` registration seat (list, session
 *   scope) and renders one tab at a time through `only: <active id>`;
 * - registers the expand/collapse toggle into the global application navbar;
 * - deliberately ships no feature tab: other plugins own actual behavior.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { HostObservable } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { resolveSlotLabel } from '@deepseek-ai/dsh-client-ui-slots'
import { RightSidebarPanel } from './RightSidebarPanel'
import { RightSidebarToggle } from './RightSidebarToggle'
import { createRightSidebarStore } from './stores'
import { en, NS, zh } from './locales'
import { PANEL_CSS } from './panel.css'
import type { PanelInjected, RightbarTab } from './contract'

/** Required services: slot registry, locale, and official panel actions. */
export const inject = ['slots', 'locale', 'layout']

export function apply(ctx: ClientContext): void {
  const store = createRightSidebarStore()

  // Tab-ledger projection: a cached array rebuilt on ledger/locale revision
  // keeps framework selector snapshots referentially stable.
  let cachedTabs: readonly RightbarTab[] = []
  let cachedVersion = -1
  let cachedLocaleRevision = -1
  const tabs: HostObservable<readonly RightbarTab[]> = {
    getSnapshot: () => {
      const version = ctx.slots.getVersion('rightbar.tab')
      const localeRevision = ctx.locale.getSnapshot().revision
      if (version !== cachedVersion || localeRevision !== cachedLocaleRevision) {
        cachedTabs = ctx.slots.entries('rightbar.tab')
          .map(entry => ({
            id: entry.options.id ?? '',
            label: resolveSlotLabel(entry.options.label) ?? entry.options.id ?? '',
            order: entry.options.order ?? 0,
          }))
          .filter(row => row.id !== '')
          .sort((a, b) => a.order - b.order)
          .map(({ id, label }) => ({ id, label }))
        cachedVersion = version
        cachedLocaleRevision = localeRevision
      }
      return cachedTabs
    },
    subscribe: (fn: () => void) => {
      const offTabs = ctx.slots.subscribe('rightbar.tab', fn)
      const offLocale = ctx.locale.subscribe(fn)
      return () => { offTabs(); offLocale() }
    },
  }

  ctx.effect(() => {
    const offLocale = ctx.locale.register(NS, { zh, en })
    const style = document.createElement('style')
    style.dataset.pluginCss = '@dsh-external/dsh-right-sidebar'
    style.textContent = PANEL_CSS
    document.head.appendChild(style)
    return () => {
      offLocale()
      style.remove()
    }
  }, 'right-sidebar: locale + styles')

  // The column takeover: our entry wins the single `details` cell (lowest
  // priority renders) and declares the tab seat.
  ctx.slots.inject('details', () => ctx.slots.register({
    name: 'details',
    priority: -1,
    locale: NS,
    children: {
      'rightbar.tab': { kind: 'list', scope: 'session' },
    },
    store,
    inject: (): PanelInjected => ({ hooks: { tabs } }),
  }, RightSidebarPanel))

  // Root-scoped global navbar toggle; visibility comes from owner props.
  ctx.slots.inject('shell.navbar.action', () => ctx.slots.register({
    name: 'shell.navbar.action',
    id: 'right-sidebar-toggle',
    order: 100,
    locale: NS,
  }, RightSidebarToggle))
}
