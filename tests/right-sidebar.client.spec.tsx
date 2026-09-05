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
import type {
  RightSidebarInstance,
  RightSidebarLauncherEntry,
  RightSidebarWorkbench,
  ToggleInjected,
} from '../src/client/contract'
import { apply, inject } from '../src/client/index'
import { PANEL_CSS } from '../src/client/panel.css'

const silenceFixtureError = (event: ErrorEvent): void => { event.preventDefault() }

afterEach(() => {
  cleanup()
  window.removeEventListener('error', silenceFixtureError)
  vi.restoreAllMocks()
})

it('declares every browser service used by the platform', () => {
  expect(inject).toEqual(['slots', 'locale', 'layout'])
})

it('registers and tears down the column, navbar action, view seat, locale, and styles', async () => {
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
  const openDetails = vi.fn()
  const closeDetails = vi.fn()
  const toggleDetailsMaximized = vi.fn()
  ctx.provide('layout', { openDetails, closeDetails, toggleDetailsMaximized } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()

  expect(slots.entries('details').some(entry => entry.options.priority === -1)).toBe(true)
  expect(slots.entries('shell.navbar.action').map(entry => entry.options.id)).toContain('right-sidebar-toggle')
  const toggleEntry = slots.entries('shell.navbar.action')
    .find(entry => entry.options.id === 'right-sidebar-toggle')
  const injected = toggleEntry?.inject?.() as ToggleInjected
  injected.toggleDetails(false)
  injected.toggleDetails(true)
  injected.toggleDetailsMaximized()
  expect(openDetails).toHaveBeenCalledOnce()
  expect(closeDetails).toHaveBeenCalledOnce()
  expect(toggleDetailsMaximized).toHaveBeenCalledOnce()
  expect(slots.spec('rightbar.view')).toEqual({ kind: 'list', scope: 'session' })
  expect(document.head.querySelector('[data-plugin-css="@dsh-external/dsh-right-sidebar"]')).not.toBeNull()

  await fiber.dispose()
  expect(slots.entries('details').some(entry => entry.options.priority === -1)).toBe(false)
  expect(slots.entries('shell.navbar.action')).toEqual([])
  expect(slots.spec('rightbar.view')).toBeUndefined()
  expect(document.head.querySelector('[data-plugin-css="@dsh-external/dsh-right-sidebar"]')).toBeNull()
  disposeOwner()
  await slotsFiber.dispose()
})

const copy: Record<string, string> = {
  title: 'Sidebar',
  openSidebar: 'Open sidebar',
  closeSidebar: 'Close sidebar',
  maximizeSidebar: 'Maximize sidebar',
  restoreSidebar: 'Restore sidebar',
  loading: 'Loading sidebar content…',
  failed: 'This sidebar content could not be displayed',
  retry: 'Retry',
  openLauncher: 'Open launcher',
  launcherTitle: 'Open in sidebar',
  closeInstance: 'Close {title}',
  operationFailed: 'The sidebar operation could not be completed',
}

function instance(id: string, title: string, viewId = 'editor'): RightSidebarInstance {
  return { id, title, viewId }
}

function source<T>(initial: T) {
  let snapshot = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: (): T => snapshot,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    set(next: T): void {
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
  }
}

interface PanelOptions {
  readonly instances?: readonly RightSidebarInstance[]
  readonly activeInstanceId?: string
  readonly launchers?: readonly RightSidebarLauncherEntry[]
  readonly content?: (instanceId: string, viewId: string) => React.ReactNode
  readonly launch?: (launcherId: string) => Promise<void>
  readonly close?: (instanceId: string) => Promise<void>
}

function mountPanel(options: PanelOptions = {}) {
  const workbench = source<RightSidebarWorkbench>({
    instances: options.instances ?? [],
    activeInstanceId: options.activeInstanceId,
  })
  const launchers = source(options.launchers ?? [])
  const unmountWorkbench = vi.fn()
  const mountWorkbench = vi.fn(() => unmountWorkbench)
  const rendered: Array<{ instanceId: string; viewId: string }> = []
  const useWorkbench = (<S,>(selector: (snapshot: RightSidebarWorkbench) => S): S =>
    selector(useSyncExternalStore(workbench.subscribe, workbench.getSnapshot))) as RightSidebarPanelProps['useWorkbench']
  const useLaunchers = (<S,>(selector: (rows: readonly RightSidebarLauncherEntry[]) => S): S =>
    selector(useSyncExternalStore(launchers.subscribe, launchers.getSnapshot))) as RightSidebarPanelProps['useLaunchers']

  const setActive = (id: string | undefined): void => {
    workbench.set({ ...workbench.getSnapshot(), activeInstanceId: id })
  }
  const activateInstance = vi.fn((id: string) => { setActive(id) })
  const showLauncher = vi.fn(() => { setActive(undefined) })
  const launch = vi.fn(options.launch ?? (async () => {}))
  const closeInstance = vi.fn(options.close ?? (async (id: string) => {
    const current = workbench.getSnapshot()
    const index = current.instances.findIndex(row => row.id === id)
    const instances = current.instances.filter(row => row.id !== id)
    const activeInstanceId = current.activeInstanceId === id
      ? instances[index]?.id ?? instances[index - 1]?.id
      : current.activeInstanceId
    workbench.set({ instances, activeInstanceId })
  }))
  const view = render(<RightSidebarPanel {...({
    renderSlot: (_name: string, owner: { instanceId: string }, renderOptions: { only?: string }) => {
      const viewId = renderOptions.only ?? ''
      rendered.push({ instanceId: owner.instanceId, viewId })
      return options.content?.(owner.instanceId, viewId)
        ?? <div data-testid="view-content">{`${viewId}:${owner.instanceId}`}</div>
    },
    useWorkbench,
    useLaunchers,
    mountWorkbench,
    showLauncher,
    launch,
    activateInstance,
    closeInstance,
    t: (key: string, values?: { title?: string }) => {
      const value = copy[key] ?? key
      return values?.title === undefined ? value : value.replace('{title}', values.title)
    },
  } as unknown as RightSidebarPanelProps)} />)

  return {
    ...view,
    workbench,
    launchers,
    rendered,
    mountWorkbench,
    unmountWorkbench,
    showLauncher,
    launch,
    activateInstance,
    closeInstance,
  }
}

describe('RightSidebarPanel', () => {
  it('opens on the launcher home without selecting a business feature', () => {
    const view = mountPanel()
    expect(view.mountWorkbench).toHaveBeenCalledOnce()
    expect(view.getByRole('heading', { name: 'Open in sidebar' })).toBeTruthy()
    const launcher = view.getByRole('button', { name: 'Open launcher' })
    expect(launcher.getAttribute('data-active')).toBe('true')
    expect(launcher.getAttribute('aria-pressed')).toBe('true')
    expect(view.queryByText('Files')).toBeNull()
    expect(view.queryByRole('tab')).toBeNull()
    expect(view.rendered).toEqual([])
    view.unmount()
    expect(view.unmountWorkbench).toHaveBeenCalledOnce()
  })

  it('renders the active static view with its instance id and keeps instances on launcher home', () => {
    const view = mountPanel({
      instances: [instance('a', 'Draft A'), instance('b', 'Draft B', 'preview')],
      activeInstanceId: 'a',
    })
    expect(view.getByTestId('view-content').textContent).toBe('editor:a')
    fireEvent.click(view.getByRole('tab', { name: 'Draft B' }))
    expect(view.getByTestId('view-content').textContent).toBe('preview:b')
    expect(view.activateInstance).toHaveBeenCalledWith('b')
    expect(view.rendered.at(-1)).toEqual({ instanceId: 'b', viewId: 'preview' })

    fireEvent.click(view.getByRole('button', { name: 'Open launcher' }))
    expect(view.getByRole('heading', { name: 'Open in sidebar' })).toBeTruthy()
    expect(view.getAllByRole('tab')).toHaveLength(2)
    expect(view.workbench.getSnapshot().instances.map(row => row.id)).toEqual(['a', 'b'])
  })

  it('supports ordered keyboard navigation and focuses the next active control', async () => {
    const view = mountPanel({
      instances: [instance('one', 'One'), instance('two', 'Two'), instance('three', 'Three')],
      activeInstanceId: 'one',
    })
    const first = view.getByRole('tab', { name: 'One' })
    const last = view.getByRole('tab', { name: 'Three' })
    first.focus()
    fireEvent.keyDown(first, { key: 'End' })
    await waitFor(() => { expect(document.activeElement).toBe(last) })
    expect(view.workbench.getSnapshot().activeInstanceId).toBe('three')
    expect(first.hasAttribute('aria-controls')).toBe(false)
    const controlled = last.getAttribute('aria-controls')
    expect(controlled).not.toBeNull()
    expect(document.getElementById(controlled!)).not.toBeNull()

    fireEvent.click(view.getByRole('button', { name: 'Close Three' }))
    await waitFor(() => {
      expect(view.workbench.getSnapshot().activeInstanceId).toBe('two')
      expect(document.activeElement).toBe(view.getByRole('tab', { name: 'Two' }))
    })
  })

  it('keeps launcher access fixed and reports launch rejection in the panel', async () => {
    let rejectLaunch: ((error: Error) => void) | undefined
    const launch = () => new Promise<void>((_resolve, reject) => { rejectLaunch = reject })
    const view = mountPanel({
      launchers: [{ id: 'editor', label: 'Editor' }],
      launch,
    })
    const launcher = view.getByRole('button', { name: 'Editor' })
    fireEvent.click(launcher)
    expect((launcher as HTMLButtonElement).disabled).toBe(true)
    rejectLaunch?.(new Error('fixture launch failed'))
    await waitFor(() => {
      expect(view.getByRole('alert').textContent).toBe('The sidebar operation could not be completed')
      expect((launcher as HTMLButtonElement).disabled).toBe(false)
    })
    expect(view.launch).toHaveBeenCalledWith('editor')
  })

  it('contains a launcher label failure and retries that contribution', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.addEventListener('error', silenceFixtureError)
    let failing = true
    const view = mountPanel({
      launchers: [{
        id: 'unstable',
        label: () => {
          if (failing) throw new Error('fixture label failed')
          return 'Recovered launcher'
        },
      }],
    })
    expect(view.getByRole('alert').textContent).toContain('could not be completed')
    failing = false
    fireEvent.click(view.getByRole('button', { name: 'Retry' }))
    expect(view.getByRole('button', { name: 'Recovered launcher' })).toBeTruthy()
    report.mockRestore()
  })

  it('shows a loading state for a suspended contribution', () => {
    const Pending = lazy(() => new Promise<never>(() => {}))
    const view = mountPanel({
      instances: [instance('slow', 'Slow')],
      activeInstanceId: 'slow',
      content: () => <Pending />,
    })
    expect(view.getByRole('status').textContent).toBe('Loading sidebar content…')
  })

  it('contains a contribution failure and retries it in place', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.addEventListener('error', silenceFixtureError)
    let failing = true
    function Unstable() {
      if (failing) throw new Error('fixture failure')
      return <div>Recovered content</div>
    }
    const view = mountPanel({
      instances: [instance('unstable', 'Unstable')],
      activeInstanceId: 'unstable',
      content: () => <Unstable />,
    })
    expect(view.getByRole('alert').textContent).toContain('could not be displayed')
    failing = false
    fireEvent.click(view.getByRole('button', { name: 'Retry' }))
    expect(view.getByText('Recovered content')).toBeTruthy()
    report.mockRestore()
  })

  it('contains an undefined thrown value', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.addEventListener('error', silenceFixtureError)
    function UndefinedFailure(): never { throw undefined }
    const view = mountPanel({
      instances: [instance('undefined-failure', 'Undefined failure')],
      activeInstanceId: 'undefined-failure',
      content: () => <UndefinedFailure />,
    })
    expect(view.getByRole('alert').textContent).toContain('could not be displayed')
    report.mockRestore()
  })

  it('makes tab labels scroll while launcher and Host-control clearance stay fixed', () => {
    expect(PANEL_CSS).toContain('padding:12px var(--dsh-shell-navbar-width,80px) 12px 7px')
    expect(PANEL_CSS).toContain('overflow-x:auto;scrollbar-width:thin;flex:1 1 auto')
    expect(PANEL_CSS).toContain('.dsh-rightbar-launcher-toggle')
    expect(PANEL_CSS).toContain('flex:none')
  })
})

describe('RightSidebarToggle', () => {
  it('matches host header-control geometry without a resting edge or shadow', () => {
    expect(PANEL_CSS).toContain('width:32px;height:32px')
    expect(PANEL_CSS).toContain('padding:0;border:none;border-radius:8px;background:transparent')
    expect(PANEL_CSS).toContain(".dsh-rightbar-toggle[data-active='true']{background:var(--dsw-alias-button-ghost-active-fill")
    expect(PANEL_CSS).not.toContain('box-shadow')
  })

  it.each([
    {
      state: 'closed', detailsOpen: false, detailsMaximized: false,
      labels: ['Open sidebar'], sidebarLabel: 'Open sidebar', maximizeLabel: undefined,
    },
    {
      state: 'open', detailsOpen: true, detailsMaximized: false,
      labels: ['Maximize sidebar', 'Close sidebar'], sidebarLabel: 'Close sidebar', maximizeLabel: 'Maximize sidebar',
    },
    {
      state: 'maximized', detailsOpen: true, detailsMaximized: true,
      labels: ['Restore sidebar', 'Close sidebar'], sidebarLabel: 'Close sidebar', maximizeLabel: 'Restore sidebar',
    },
  ])('renders and operates the $state state', ({
    detailsOpen, detailsMaximized, labels, sidebarLabel, maximizeLabel,
  }) => {
    const toggleDetails = vi.fn()
    const toggleDetailsMaximized = vi.fn()
    const view = render(<RightSidebarToggle {...({
      detailsOpen,
      detailsMaximized,
      toggleDetails,
      toggleDetailsMaximized,
      t: (key: string) => copy[key] ?? key,
    } as unknown as RightSidebarToggleProps)} />)

    expect(view.getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual(labels)
    const sidebar = view.getByRole('button', { name: sidebarLabel })
    expect(sidebar.getAttribute('title')).toBe(sidebarLabel)
    expect(sidebar.getAttribute('aria-pressed')).toBe(String(detailsOpen))
    expect(sidebar.getAttribute('data-active')).toBe(String(detailsOpen))
    fireEvent.click(sidebar)
    expect(toggleDetails).toHaveBeenCalledOnce()
    expect(toggleDetails).toHaveBeenCalledWith(detailsOpen)

    if (maximizeLabel === undefined) {
      expect(toggleDetailsMaximized).not.toHaveBeenCalled()
      return
    }
    const maximize = view.getByRole('button', { name: maximizeLabel })
    expect(maximize.getAttribute('title')).toBe(maximizeLabel)
    expect(maximize.getAttribute('aria-pressed')).toBe(String(detailsMaximized))
    expect(maximize.getAttribute('data-active')).toBe(String(detailsMaximized))
    fireEvent.click(maximize)
    expect(toggleDetailsMaximized).toHaveBeenCalledOnce()
  })
})
