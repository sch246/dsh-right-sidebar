// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { lazy, useSyncExternalStore } from 'react'
import { Context } from '@deepseek-ai/cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { RightSidebarPanel } from '../src/client/RightSidebarPanel'
import type { RightSidebarPanelProps } from '../src/client/RightSidebarPanel'
import { RightSidebarToggle } from '../src/client/RightSidebarToggle'
import type { RightSidebarToggleProps } from '../src/client/RightSidebarToggle'
import type { RightbarTab } from '../src/client/contract'
import { createRightSidebarStore } from '../src/client/stores'
import { apply, inject } from '../src/client/index'
import { PANEL_CSS } from '../src/client/panel.css'

afterEach(() => { cleanup() })

it('declares every browser service used by the platform', () => {
  expect(inject).toEqual(['slots', 'locale', 'layout'])
})

it('registers and tears down the column, navbar action, tab seat, locale, and styles', async () => {
  const ctx = new Context()
  const slotsFiber = ctx.plugin(SlotRegistry)
  await slotsFiber.await()
  const slots = ctx.get('slots') as SlotRegistry
  const disposeOwner = slots.register({
    name: 'root',
    children: {
      details: { kind: 'single', scope: 'session' },
      'shell.navbar.action': { kind: 'list', scope: 'root' },
    },
  }, (() => null) as never)
  ctx.provide('locale', new LocaleRuntime(ctx))
  ctx.provide('layout', {
    toggleSidebar: vi.fn(), openDetails: vi.fn(), closeDetails: vi.fn(),
  } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  expect(slots.entries('details').some(entry => entry.options.priority === -1)).toBe(true)
  expect(slots.entries('shell.navbar.action').map(entry => entry.options.id)).toContain('right-sidebar-toggle')
  expect(slots.spec('rightbar.tab')).toEqual({ kind: 'list', scope: 'session' })
  expect(document.head.querySelector('[data-plugin-css="@dsh-external/dsh-right-sidebar"]')).not.toBeNull()

  await fiber.dispose()
  expect(slots.entries('details').some(entry => entry.options.priority === -1)).toBe(false)
  expect(slots.entries('shell.navbar.action')).toEqual([])
  expect(slots.spec('rightbar.tab')).toBeUndefined()
  expect(document.head.querySelector('[data-plugin-css="@dsh-external/dsh-right-sidebar"]')).toBeNull()
  disposeOwner()
})

const copy: Record<string, string> = {
  title: 'Sidebar', collapse: 'Collapse', expand: 'Expand',
  loading: 'Loading sidebar content…', failed: 'This sidebar content could not be displayed', retry: 'Retry',
}

function tab(id: string, label: string): RightbarTab {
  return { id, label }
}

function mountPanel(initialRows: readonly RightbarTab[], content?: () => React.ReactNode) {
  const instance = createRightSidebarStore().create('session-test')
  let rows = initialRows
  const rendered: string[] = []
  const unmountOpenTabApi = vi.fn()
  const mountOpenTabApi = vi.fn(() => unmountOpenTabApi)
  const useStore = (<S,>(selector: (state: { activeTab: string }) => S): S =>
    selector(useSyncExternalStore(instance.subscribe, instance.getSnapshot))) as RightSidebarPanelProps['useStore']
  const element = () => <RightSidebarPanel {...({
    useStore,
    actions: instance.actions,
    mountOpenTabApi,
    useTabs: (selector: (value: readonly RightbarTab[]) => unknown) => selector(rows),
    renderSlot: (_name: string, _owner: object, options: { only?: string }) => {
      rendered.push(options.only ?? '')
      return content?.() ?? <div data-testid="tab-content">{options.only}</div>
    },
    t: (key: string) => copy[key] ?? key,
  } as unknown as RightSidebarPanelProps)} />
  const view = render(element())
  return {
    ...view,
    instance,
    mountOpenTabApi,
    unmountOpenTabApi,
    rendered,
    setRows(next: readonly RightbarTab[]) { rows = next; view.rerender(element()) },
  }
}

describe('RightSidebarPanel', () => {
  it('keeps an empty platform mounted without redundant visible chrome', () => {
    const view = mountPanel([])
    expect(view.mountOpenTabApi).toHaveBeenCalledOnce()
    expect(view.container.querySelector('.dsh-rightbar-root')).not.toBeNull()
    expect(view.queryByText('No sidebar tabs registered')).toBeNull()
    expect(view.queryByText('Sidebar')).toBeNull()
    expect(view.queryByRole('button', { name: 'Collapse' })).toBeNull()
    expect(view.queryByRole('tab')).toBeNull()
    view.unmount()
    expect(view.unmountOpenTabApi).toHaveBeenCalledOnce()
  })

  it('renders only the selected contribution and repairs selection after unload', async () => {
    const view = mountPanel([tab('files', 'Files'), tab('outline', 'Outline')])
    expect(view.getByTestId('tab-content').textContent).toBe('files')
    fireEvent.click(view.getByRole('tab', { name: 'Outline' }))
    view.getByRole('tab', { name: 'Outline' }).focus()
    expect(view.getByTestId('tab-content').textContent).toBe('outline')
    expect(view.instance.getSnapshot().activeTab).toBe('outline')

    view.setRows([tab('files', 'Files')])
    expect(view.getByTestId('tab-content').textContent).toBe('files')
    await waitFor(() => {
      expect(view.instance.getSnapshot().activeTab).toBe('files')
      expect(document.activeElement).toBe(view.getByRole('tab', { name: 'Files' }))
    })
  })

  it('supports arrow-key tab navigation', () => {
    const view = mountPanel([tab('one', 'One'), tab('two', 'Two')])
    const first = view.getByRole('tab', { name: 'One' })
    const second = view.getByRole('tab', { name: 'Two' })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(second)
    expect(view.instance.getSnapshot().activeTab).toBe('two')
    expect(first.hasAttribute('aria-controls')).toBe(false)
    const controlled = second.getAttribute('aria-controls')
    expect(controlled).not.toBeNull()
    expect(document.getElementById(controlled!)).not.toBeNull()
  })

  it('shows a loading state for a suspended contribution', () => {
    const Pending = lazy(() => new Promise<never>(() => {}))
    const view = mountPanel([tab('slow', 'Slow')], () => <Pending />)
    expect(view.getByRole('status').textContent).toBe('Loading sidebar content…')
  })

  it('contains a contribution failure and retries it in place', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    const silenceFixtureError = (event: ErrorEvent): void => { event.preventDefault() }
    window.addEventListener('error', silenceFixtureError)
    let failing = true
    function Unstable() {
      if (failing) throw new Error('fixture failure')
      return <div>Recovered content</div>
    }
    const view = mountPanel([tab('unstable', 'Unstable')], () => <Unstable />)
    expect(view.getByRole('alert').textContent).toContain('could not be displayed')
    failing = false
    fireEvent.click(view.getByRole('button', { name: 'Retry' }))
    expect(view.getByText('Recovered content')).toBeTruthy()
    window.removeEventListener('error', silenceFixtureError)
    report.mockRestore()
  })

  it('contains an undefined thrown value', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    const silenceFixtureError = (event: ErrorEvent): void => { event.preventDefault() }
    window.addEventListener('error', silenceFixtureError)
    function UndefinedFailure(): never { throw undefined }
    const view = mountPanel([tab('undefined-failure', 'Undefined failure')], () => <UndefinedFailure />)
    expect(view.getByRole('alert').textContent).toContain('could not be displayed')
    window.removeEventListener('error', silenceFixtureError)
    report.mockRestore()
  })
})

describe('RightSidebarToggle', () => {
  it('matches host header-control geometry without a resting edge or shadow', () => {
    expect(PANEL_CSS).toContain('width:32px;height:32px')
    expect(PANEL_CSS).toContain('padding:0;border:none;border-radius:8px;background:transparent')
    expect(PANEL_CSS).not.toContain('box-shadow')
  })

  it('uses the layout owner state and actions directly', () => {
    const openDetails = vi.fn()
    const closeDetails = vi.fn()
    const element = (detailsOpen: boolean) => <RightSidebarToggle {...({
      detailsOpen,
      toggleDetails: detailsOpen ? closeDetails : openDetails,
      t: (key: string) => copy[key] ?? key,
    } as unknown as RightSidebarToggleProps)} />
    const view = render(element(false))
    fireEvent.click(view.getByRole('button', { name: 'Expand' }))
    expect(openDetails).toHaveBeenCalledOnce()
    view.rerender(element(true))
    fireEvent.click(view.getByRole('button', { name: 'Collapse' }))
    expect(closeDetails).toHaveBeenCalledOnce()
  })
})
