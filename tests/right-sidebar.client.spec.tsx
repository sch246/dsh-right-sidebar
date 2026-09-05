// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, createEvent, fireEvent, render } from '@testing-library/react'
import { lazy, useEffect, useSyncExternalStore } from 'react'
import { Context } from '@deepseek-ai/cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { RightSidebarPanel, type RightSidebarPanelProps } from '../src/client/RightSidebarPanel'
import { RightSidebarToggle, type RightSidebarToggleProps } from '../src/client/RightSidebarToggle'
import type {
  RightSidebarGroup,
  RightSidebarInstance,
  RightSidebarLauncherEntry,
  RightSidebarLayoutNode,
  RightSidebarWorkbench,
  ToggleInjected,
} from '../src/client/contract'
import { apply, inject } from '../src/client/index'
import { groupsOf } from '../src/client/layout'
import { PANEL_CSS } from '../src/client/panel.css'

const silenceFixtureError = (event: ErrorEvent): void => { event.preventDefault() }

beforeEach(() => { localStorage.clear() })
afterEach(() => {
  cleanup()
  document.head.querySelectorAll('[data-test-rightbar-styles]').forEach(element => { element.remove() })
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
  const toggleEntry = slots.entries('shell.navbar.action').find(entry => entry.options.id === 'right-sidebar-toggle')
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
  title: 'Sidebar', openSidebar: 'Open sidebar', closeSidebar: 'Close sidebar',
  maximizeSidebar: 'Maximize sidebar', restoreSidebar: 'Restore sidebar', loading: 'Loading sidebar content…',
  failed: 'This sidebar content could not be displayed', retry: 'Retry', openLauncher: 'Open launcher',
  launcherTitle: 'Open in sidebar', closeInstance: 'Close {title}', operationFailed: 'Operation failed',
  useVerticalTabs: 'Use vertical tabs', useHorizontalTabs: 'Use horizontal tabs',
  defaultVerticalTabs: 'Use vertical tabs for new groups', defaultHorizontalTabs: 'Use horizontal tabs for new groups',
  resizeGroups: 'Resize adjacent groups', resizeTabRail: 'Resize vertical tab rail', restoreTabRail: 'Restore tab rail',
  restoringInstance: 'Restoring this content…', restoreFailed: 'Could not restore',
  missingView: 'Plugin unavailable',
}

function instance(
  id: string,
  title: string,
  options: Partial<RightSidebarInstance> = {},
): RightSidebarInstance {
  return { id, title, viewId: 'editor', preview: false, availability: 'ready', ...options }
}

function group(
  id: string,
  instances: readonly RightSidebarInstance[],
  activeInstanceId = instances[0]?.id,
  overrides: Partial<RightSidebarGroup> = {},
): RightSidebarGroup {
  return {
    kind: 'group', id, tabOrientation: 'horizontal', verticalRailWidth: 180,
    instances, activeInstanceId, ...overrides,
  }
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

function mountPanel(
  initialRoot: RightSidebarLayoutNode = group('group-1', []),
  launchers: readonly RightSidebarLauncherEntry[] = [],
  content?: (instanceId: string) => React.ReactNode,
) {
  const firstGroup = groupsOf(initialRoot)[0] as RightSidebarGroup
  const workbench = source<RightSidebarWorkbench>({
    root: initialRoot,
    activeGroupId: firstGroup.id,
    defaultTabOrientation: 'horizontal',
  })
  const launcherSource = source(launchers)
  const actions = {
    mountWorkbench: vi.fn(() => vi.fn()),
    showLauncher: vi.fn(),
    launch: vi.fn(async () => {}),
    activateInstance: vi.fn(),
    activateGroup: vi.fn(),
    pinInstance: vi.fn(),
    closeInstance: vi.fn(async () => {}),
    retryRestore: vi.fn(async () => {}),
    moveInstance: vi.fn(),
    setGroupTabOrientation: vi.fn(),
    setGroupVerticalRailWidth: vi.fn(),
    setDefaultTabOrientation: vi.fn(),
    setSplitRatio: vi.fn(),
  }
  const useWorkbench = (<S,>(selector: (snapshot: RightSidebarWorkbench) => S): S =>
    selector(useSyncExternalStore(workbench.subscribe, workbench.getSnapshot))) as RightSidebarPanelProps['useWorkbench']
  const useLaunchers = (<S,>(selector: (rows: readonly RightSidebarLauncherEntry[]) => S): S =>
    selector(useSyncExternalStore(launcherSource.subscribe, launcherSource.getSnapshot))) as RightSidebarPanelProps['useLaunchers']
  const rendered: string[] = []
  const view = render(<RightSidebarPanel {...({
    renderSlot: (_name: string, owner: { instanceId: string }, options: { only?: string }) => {
      rendered.push(`${options.only}:${owner.instanceId}`)
      return content?.(owner.instanceId)
        ?? <div data-testid={`view-${owner.instanceId}`}>{`${options.only}:${owner.instanceId}`}</div>
    },
    useWorkbench,
    useLaunchers,
    ...actions,
    t: (key: string, values?: { title?: string }) => {
      const value = copy[key] ?? key
      return values?.title === undefined ? value : value.replace('{title}', values.title)
    },
  } as unknown as RightSidebarPanelProps)} />)
  return { ...view, workbench, launcherSource, rendered, ...actions }
}

describe('RightSidebarPanel', () => {
  it('keeps content visible below group chrome when the Host base background is opaque', () => {
    const styles = document.createElement('style')
    styles.dataset.testRightbarStyles = ''
    styles.textContent = PANEL_CSS
    document.head.append(styles)
    const view = mountPanel(group('group-1', [instance('a', 'A')]))
    const root = view.container.querySelector('.dsh-rightbar-root') as HTMLElement
    root.style.setProperty('--dsw-alias-bg-base', 'rgb(255, 0, 0)')
    const chrome = view.container.querySelector('.dsh-rightbar-group') as HTMLElement
    const chromeLayout = view.container.querySelector('.dsh-rightbar-group-layout') as HTMLElement
    const surface = view.container.querySelector('.dsh-rightbar-surface') as HTMLElement
    expect(getComputedStyle(chrome).zIndex).toBe('2')
    expect(getComputedStyle(surface).zIndex).toBe('1')
    expect(getComputedStyle(chromeLayout).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(view.getByTestId('view-a').textContent).toBe('editor:a')
  })

  it('keeps global controls separate and renders active group content', () => {
    const view = mountPanel(group('group-1', [
      instance('a', 'Draft A'), instance('b', 'Draft B', { viewId: 'preview' }),
    ], 'a'))
    expect(view.getByRole('button', { name: 'Open launcher' })).toBeTruthy()
    expect(view.getByTestId('view-a').textContent).toBe('editor:a')
    fireEvent.click(view.getByRole('tab', { name: 'Draft B' }))
    expect(view.activateInstance).toHaveBeenCalledWith('b')
    expect(PANEL_CSS).toContain("[data-top='true'][data-right='true'] .dsh-rightbar-tabs{padding-right:var(--dsh-shell-navbar-width,80px)")
  })

  it('left-aligns vertical tab labels and fixed action icons', () => {
    const styles = document.createElement('style')
    styles.dataset.testRightbarStyles = ''
    styles.textContent = PANEL_CSS
    document.head.append(styles)
    const view = mountPanel(group('group-1', [instance('a', 'A')], 'a', { tabOrientation: 'vertical' }))
    const label = getComputedStyle(view.getByRole('tab', { name: 'A' }))
    expect(label.textAlign).toBe('left')
    expect(label.display).toBe('block')
    const actions = view.container.querySelector('.dsh-rightbar-group-actions') as HTMLElement
    expect(getComputedStyle(actions).alignItems).toBe('flex-start')
    for (const button of actions.querySelectorAll('button')) {
      expect(getComputedStyle(button).justifyContent).toBe('flex-start')
    }
  })

  it('keeps pinning, dragging and closing without a tab action menu', async () => {
    const view = mountPanel(group('group-1', [instance('preview', 'Preview', { preview: true })]))
    const tab = view.getByRole('tab', { name: 'Preview' })
    expect(tab.parentElement?.getAttribute('data-preview')).toBe('true')
    fireEvent.doubleClick(tab)
    expect(view.pinInstance).toHaveBeenCalledWith('preview')
    expect(view.queryByRole('menu')).toBeNull()
    expect(view.container.querySelector('.dsh-rightbar-tab-actions')).toBeNull()
    const transfer = dataTransfer()
    fireEvent.dragStart(tab, { dataTransfer: transfer })
    fireEvent.drop(view.getByRole('tablist'), { dataTransfer: transfer })
    expect(view.moveInstance).toHaveBeenCalledWith('preview', { groupId: 'group-1', direction: 'center', index: 1 })
    await act(async () => { fireEvent.click(view.getByRole('button', { name: 'Close Preview' })) })
    expect(view.closeInstance).toHaveBeenCalledWith('preview')
  })

  it('offers keyboard navigation and non-drag edge movement', () => {
    const view = mountPanel(group('group-1', [instance('one', 'One'), instance('two', 'Two')], 'one'))
    const first = view.getByRole('tab', { name: 'One' })
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(view.activateInstance).toHaveBeenCalledWith('two')
    fireEvent.keyDown(first, { key: 'ArrowRight', altKey: true, shiftKey: true })
    expect(view.moveInstance).toHaveBeenCalledWith('one', { groupId: 'group-1', direction: 'right' })
  })

  it('captures internal content drops without intercepting external editor drops', () => {
    const editorDrop = vi.fn()
    const view = mountPanel(
      group('group-1', [instance('a', 'A')]),
      [],
      () => <div data-testid="editor-drop-target" onDrop={editorDrop}>Editor</div>,
    )
    const workspace = view.container.querySelector('.dsh-rightbar-workspace') as HTMLElement
    const editor = view.getByTestId('editor-drop-target')
    vi.spyOn(workspace, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => {},
    })
    setRect(editor.closest('.dsh-rightbar-surface') as HTMLElement, { left: 0, top: 20, width: 100, height: 80 })
    const internal = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: internal })
    expect(internal.types).toContain('application/x-dsh-right-sidebar-instance')
    expect(internal.types).not.toContain('text/plain')
    const dragOver = createEvent.dragOver(editor, { dataTransfer: internal })
    Object.defineProperties(dragOver, {
      clientX: { value: 95 },
      clientY: { value: 50 },
    })
    fireEvent(editor, dragOver)
    expect(view.moveInstance).not.toHaveBeenCalled()
    const preview = view.container.querySelector('.dsh-rightbar-drop-preview') as HTMLElement
    expect(preview.style.left).toBe('50%')
    expect(preview.style.width).toBe('50%')
    const internalDrop = createEvent.drop(editor, { dataTransfer: internal })
    Object.defineProperties(internalDrop, {
      clientX: { value: 95 },
      clientY: { value: 50 },
    })
    fireEvent(editor, internalDrop)
    expect(editorDrop).not.toHaveBeenCalled()
    expect(view.moveInstance).toHaveBeenCalledWith('a', { groupId: 'group-1', direction: 'right' })

    const external = dataTransfer({ 'text/plain': 'external text' })
    fireEvent.drop(editor, { dataTransfer: external, clientX: 50, clientY: 50 })
    expect(editorDrop).toHaveBeenCalledOnce()
    expect(view.moveInstance).toHaveBeenCalledTimes(1)
  })

  it('keeps internal tab-bar reordering on the tab drop target', () => {
    const view = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')]))
    const internal = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: internal })
    setRect(view.getByRole('tab', { name: 'A' }).parentElement!, { left: 0, top: 0, width: 100, height: 30 })
    setRect(view.getByRole('tab', { name: 'B' }).parentElement!, { left: 100, top: 0, width: 100, height: 30 })
    dragAt('drop', view.getByRole('tab', { name: 'B' }), internal, 125, 15)
    expect(view.moveInstance).toHaveBeenCalledWith('a', {
      groupId: 'group-1', direction: 'center', index: 1,
    })
  })

  it.each(['horizontal', 'vertical'] as const)('previews exact %s insertion slots without a content overlay', orientation => {
    const view = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')], 'a', {
      tabOrientation: orientation,
    }))
    const tabs = [...view.container.querySelectorAll<HTMLElement>('.dsh-rightbar-tab')]
    tabs.forEach((tab, index) => {
      setRect(tab, orientation === 'horizontal'
        ? { left: index * 100, top: 0, width: 100, height: 30 }
        : { left: 0, top: index * 30, width: 100, height: 30 })
    })
    const transfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: transfer })
    const point = orientation === 'horizontal' ? [175, 15] : [50, 55]
    dragAt('dragOver', view.getByRole('tab', { name: 'B' }), transfer, point[0]!, point[1]!)
    expect(view.container.querySelector('.dsh-rightbar-drop-preview')).toBeNull()
    const line = view.container.querySelector('.dsh-rightbar-tab-insertion')
    expect(line?.parentElement).toBe(tabs[1])
    expect(line?.getAttribute('data-end')).toBe('true')
    expect(view.moveInstance).not.toHaveBeenCalled()
    dragAt('drop', view.getByRole('tab', { name: 'B' }), transfer, point[0]!, point[1]!)
    expect(view.moveInstance).toHaveBeenCalledWith('a', { groupId: 'group-1', direction: 'center', index: 2 })
    expect(view.container.querySelector('.dsh-rightbar-tab-insertion')).toBeNull()
  })

  it.each(['Open launcher', 'Use vertical tabs'])('treats the %s action as tab insertion space', name => {
    const view = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')]))
    const workspace = view.container.querySelector('.dsh-rightbar-workspace') as HTMLElement
    setRect(workspace, { left: 0, top: 0, width: 400, height: 400 })
    const transfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: transfer })
    dragAt('dragOver', view.getByRole('button', { name }), transfer, 395, 20)
    expect(view.container.querySelector('.dsh-rightbar-drop-preview')).toBeNull()
    dragAt('drop', view.getByRole('button', { name }), transfer, 395, 20)
    expect(view.moveInstance).toHaveBeenCalledWith('a', { groupId: 'group-1', direction: 'center', index: 2 })
  })

  it('docks from the content left edge beside a vertical rail and confines its preview to content', () => {
    const view = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')], 'a', {
      tabOrientation: 'vertical',
    }))
    const workspace = view.container.querySelector('.dsh-rightbar-workspace') as HTMLElement
    const surface = view.container.querySelector('.dsh-rightbar-surface') as HTMLElement
    setRect(workspace, { left: 0, top: 0, width: 400, height: 400 })
    setRect(surface, { left: 180, top: 56, width: 220, height: 344 })
    const transfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'B' }), { dataTransfer: transfer })
    dragAt('dragOver', view.getByTestId('view-a'), transfer, 185, 200)
    const preview = view.container.querySelector('.dsh-rightbar-drop-preview') as HTMLElement
    expect(preview.style.left).toBe('45%')
    expect(Number.parseFloat(preview.style.width)).toBeCloseTo(27.5)
    expect(Number.parseFloat(preview.style.top)).toBeCloseTo(14)
    dragAt('drop', view.getByTestId('view-a'), transfer, 185, 200)
    expect(view.moveInstance).toHaveBeenCalledWith('b', { groupId: 'group-1', direction: 'left' })
  })

  it.each([
    ['left', 205, 300, 50, 25, 25, 75],
    ['right', 395, 300, 75, 25, 25, 75],
    ['up', 300, 105, 50, 25, 50, 37.5],
    ['down', 300, 395, 50, 62.5, 50, 37.5],
    ['center', 300, 300, 50, 25, 50, 75],
  ] as const)('resolves %s from the destination content rectangle', (direction, x, y, left, top, width, height) => {
    const view = mountPanel({
      kind: 'split', id: 'split', axis: 'horizontal', ratio: 0.5,
      first: group('left', [instance('a', 'A')]), second: group('right', [instance('b', 'B')]),
    })
    const workspace = view.container.querySelector('.dsh-rightbar-workspace') as HTMLElement
    setRect(workspace, { left: 0, top: 0, width: 400, height: 400 })
    setRect(view.getByTestId('view-b').closest('.dsh-rightbar-surface') as HTMLElement, {
      left: 200, top: 100, width: 200, height: 300,
    })
    const transfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: transfer })
    dragAt('dragOver', view.getByTestId('view-b'), transfer, x, y)
    const preview = view.container.querySelector('.dsh-rightbar-drop-preview') as HTMLElement
    for (const [property, expected] of Object.entries({ left, top, width, height })) {
      expect(Number.parseFloat(preview.style.getPropertyValue(property))).toBeCloseTo(expected)
    }
    expect(view.moveInstance).not.toHaveBeenCalled()
    dragAt('drop', view.getByTestId('view-b'), transfer, x, y)
    expect(view.moveInstance).toHaveBeenCalledWith('a', { groupId: 'right', direction })
    expect(view.container.querySelector('.dsh-rightbar-drop-preview')).toBeNull()
  })

  it('replaces content preview with an insertion line over empty destination tab space', () => {
    const view = mountPanel({
      kind: 'split', id: 'split', axis: 'horizontal', ratio: 0.5,
      first: group('left', [instance('a', 'A')]), second: group('empty', []),
    })
    const workspace = view.container.querySelector('.dsh-rightbar-workspace') as HTMLElement
    setRect(workspace, { left: 0, top: 0, width: 400, height: 400 })
    setRect(view.getByTestId('view-a').closest('.dsh-rightbar-surface') as HTMLElement, {
      left: 0, top: 56, width: 200, height: 344,
    })
    const transfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: transfer })
    dragAt('dragOver', view.getByTestId('view-a'), transfer, 100, 100)
    expect(view.container.querySelector('.dsh-rightbar-drop-preview')).not.toBeNull()
    const emptyList = view.getAllByRole('tablist')[1]!
    dragAt('dragOver', emptyList, transfer, 210, 20)
    expect(view.container.querySelector('.dsh-rightbar-drop-preview')).toBeNull()
    expect(emptyList.querySelector('.dsh-rightbar-tab-insertion')).not.toBeNull()
    dragAt('drop', emptyList, transfer, 210, 20)
    expect(view.moveInstance).toHaveBeenCalledWith('a', { groupId: 'empty', direction: 'center', index: 0 })
  })

  it.each([
    { deltaY: 40 }, { deltaY: 40, shiftKey: true }, { deltaX: 40 },
  ])('scrolls horizontal tabs for wheel input %j and cancels only consumed movement', input => {
    const view = mountPanel(group('group-1', [instance('a', 'A')]))
    const list = view.getByRole('tablist')
    Object.defineProperties(list, { scrollWidth: { value: 500 }, clientWidth: { value: 100 } })
    const wheel = createEvent.wheel(view.getByRole('tab', { name: 'A' }), { ...input, cancelable: true })
    fireEvent(view.getByRole('tab', { name: 'A' }), wheel)
    expect(list.scrollLeft).toBe(40)
    expect(wheel.defaultPrevented).toBe(true)
    list.scrollLeft = 400
    const atEnd = createEvent.wheel(list, { ...input, cancelable: true })
    fireEvent(list, atEnd)
    expect(atEnd.defaultPrevented).toBe(false)
    const zoom = createEvent.wheel(list, { deltaY: -40, ctrlKey: true, cancelable: true })
    fireEvent(list, zoom)
    expect(list.scrollLeft).toBe(400)
    expect(zoom.defaultPrevented).toBe(false)
  })

  it('passes unconsumed wheel events through and disposes the horizontal listener on orientation change and unmount', () => {
    const view = mountPanel(group('group-1', [instance('a', 'A')]))
    const list = view.getByRole('tablist')
    Object.defineProperties(list, {
      scrollWidth: { configurable: true, value: 100 }, clientWidth: { value: 100 },
    })
    const parentWheel = vi.fn()
    const root = view.container.querySelector('.dsh-rightbar-root') as HTMLElement
    root.addEventListener('wheel', parentWheel)
    try {
      const noOverflow = createEvent.wheel(list, { deltaY: 40, cancelable: true })
      fireEvent(list, noOverflow)
      expect(noOverflow.defaultPrevented).toBe(false)
      expect(parentWheel).toHaveBeenCalledOnce()
      Object.defineProperty(list, 'scrollWidth', { value: 500 })
      list.style.fontSize = '12px'
      fireEvent.wheel(list, { deltaY: 2, deltaMode: WheelEvent.DOM_DELTA_LINE })
      expect(list.scrollLeft).toBe(24)
      fireEvent.wheel(list, { deltaY: 1, deltaMode: WheelEvent.DOM_DELTA_PAGE })
      expect(list.scrollLeft).toBe(124)
      fireEvent.wheel(list, { deltaY: -24 })
      expect(list.scrollLeft).toBe(100)
      expect(parentWheel).toHaveBeenCalledOnce()
      act(() => {
        view.workbench.set({
          ...view.workbench.getSnapshot(),
          root: group('group-1', [instance('a', 'A')], 'a', { tabOrientation: 'vertical' }),
        })
      })
      const vertical = createEvent.wheel(list, { deltaY: 40, cancelable: true })
      fireEvent(list, vertical)
      expect(list.scrollLeft).toBe(100)
      expect(vertical.defaultPrevented).toBe(false)
      expect(parentWheel).toHaveBeenCalledTimes(2)
      act(() => {
        view.workbench.set({ ...view.workbench.getSnapshot(), root: group('group-1', [instance('a', 'A')]) })
      })
      view.unmount()
      fireEvent.wheel(list, { deltaY: 40 })
      expect(list.scrollLeft).toBe(100)
    } finally {
      root.removeEventListener('wheel', parentWheel)
    }
  })

  it('auto-scrolls horizontal and vertical tab lists during drag', () => {
    const view = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')]))
    const list = view.getByRole('tablist') as HTMLElement
    list.scrollBy = vi.fn()
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 10, width: 100, height: 30, right: 110, bottom: 40, x: 10, y: 10, toJSON: () => {},
    })
    const horizontalTransfer = dataTransfer()
    fireEvent.dragStart(view.getByRole('tab', { name: 'A' }), { dataTransfer: horizontalTransfer })
    const drag = createEvent.dragOver(list, { dataTransfer: horizontalTransfer })
    Object.defineProperties(drag, { clientX: { value: 108 }, clientY: { value: 25 } })
    fireEvent(list, drag)
    expect(list.scrollBy).toHaveBeenCalledWith({ left: 24 })
    view.unmount()

    const vertical = mountPanel(group('group-1', [instance('a', 'A'), instance('b', 'B')], 'a', {
      tabOrientation: 'vertical',
    }))
    const verticalList = vertical.getByRole('tablist') as HTMLElement
    verticalList.scrollBy = vi.fn()
    vi.spyOn(verticalList, 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 10, width: 80, height: 100, right: 90, bottom: 110, x: 10, y: 10, toJSON: () => {},
    })
    const verticalTransfer = dataTransfer()
    fireEvent.dragStart(vertical.getByRole('tab', { name: 'A' }), { dataTransfer: verticalTransfer })
    const verticalDrag = createEvent.dragOver(verticalList, { dataTransfer: verticalTransfer })
    Object.defineProperties(verticalDrag, { clientX: { value: 40 }, clientY: { value: 12 } })
    fireEvent(verticalList, verticalDrag)
    expect(verticalList.scrollBy).toHaveBeenCalledWith({ top: -24 })
  })

  it('keeps an active renderer mounted while its stable instance moves between groups', () => {
    const mounts = new Map<string, number>()
    function Probe({ id }: { readonly id: string }) {
      useEffect(() => {
        mounts.set(id, (mounts.get(id) ?? 0) + 1)
      }, [id])
      return <div>{id}</div>
    }
    const first = group('left', [instance('a', 'A')])
    const second = group('right', [instance('b', 'B')])
    const view = mountPanel({
      kind: 'split', id: 'split', axis: 'horizontal', ratio: 0.5, first, second,
    }, [], id => <Probe id={id} />)
    expect(mounts.get('a')).toBe(1)
    act(() => {
      view.workbench.set({
        ...view.workbench.getSnapshot(),
        activeGroupId: 'right',
        root: {
          kind: 'split', id: 'split', axis: 'horizontal', ratio: 0.5,
          first: group('left', [], undefined),
          second: group('right', [instance('b', 'B'), instance('a', 'A')], 'a'),
        },
      })
    })
    expect(mounts.get('a')).toBe(1)
    const split = view.getByRole('separator', { name: 'Resize adjacent groups' })
    expect(split.getAttribute('aria-valuemin')).toBe('0')
    expect(split.getAttribute('aria-valuemax')).toBe('100')
    expect(split.getAttribute('aria-valuenow')).toBe('50')
    fireEvent.keyDown(split, { key: 'ArrowRight' })
    expect(view.setSplitRatio).toHaveBeenCalledWith('split', 0.55)
  })

  it('switches group and default orientation and exposes rail recovery', () => {
    const view = mountPanel(group('group-1', [], undefined, {
      tabOrientation: 'vertical', verticalRailWidth: 20,
    }))
    fireEvent.click(view.getByRole('button', { name: 'Use horizontal tabs' }))
    expect(view.setGroupTabOrientation).toHaveBeenCalledWith('group-1', 'horizontal')
    fireEvent.click(view.getByRole('button', { name: 'Use vertical tabs for new groups' }))
    expect(view.setDefaultTabOrientation).toHaveBeenCalledWith('vertical')
    fireEvent.click(view.getByRole('button', { name: 'Restore tab rail' }))
    expect(view.setGroupVerticalRailWidth).toHaveBeenCalledWith('group-1', 180)
    const rail = view.getByRole('separator', { name: 'Resize vertical tab rail' })
    expect(rail.getAttribute('aria-valuemin')).toBe('0')
    expect(rail.getAttribute('aria-valuemax')).toBe('20')
    expect(rail.getAttribute('aria-valuenow')).toBe('20')
    fireEvent.keyDown(rail, { key: 'ArrowRight' })
    expect(view.setGroupVerticalRailWidth).toHaveBeenCalledWith('group-1', 36)
    fireEvent.keyDown(rail, { key: 'End' })
    expect(view.setGroupVerticalRailWidth).toHaveBeenCalledWith('group-1', 0)
  })

  it('shows missing, restoring, and failed restoration states', () => {
    const view = mountPanel(group('group-1', [instance('a', 'A', { availability: 'missing' })]))
    expect(view.getByRole('alert').textContent).toBe('Plugin unavailable')
    act(() => {
      view.workbench.set({
        ...view.workbench.getSnapshot(),
        root: group('group-1', [instance('a', 'A', { availability: 'failed' })]),
      })
    })
    fireEvent.click(view.getByRole('button', { name: 'Retry' }))
    expect(view.retryRestore).toHaveBeenCalledWith('a')
    act(() => {
      view.workbench.set({
        ...view.workbench.getSnapshot(),
        root: group('group-1', [instance('a', 'A', { availability: 'restoring' })]),
      })
    })
    expect(view.getByRole('status').textContent).toBe('Restoring this content…')
  })

  it('contains suspended and failed feature renderers', () => {
    const Pending = lazy(() => new Promise<never>(() => {}))
    const base = mountPanel(group('group-1', [instance('slow', 'Slow')]))
    base.unmount()
    const workbench = source<RightSidebarWorkbench>({
      root: group('group-1', [instance('slow', 'Slow')]), activeGroupId: 'group-1', defaultTabOrientation: 'horizontal',
    })
    const useWorkbench = (<S,>(selector: (snapshot: RightSidebarWorkbench) => S): S =>
      selector(useSyncExternalStore(workbench.subscribe, workbench.getSnapshot))) as RightSidebarPanelProps['useWorkbench']
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.addEventListener('error', silenceFixtureError)
    const props = {
      useWorkbench,
      useLaunchers: (<S,>(selector: (rows: readonly RightSidebarLauncherEntry[]) => S): S => selector([])) as RightSidebarPanelProps['useLaunchers'],
      mountWorkbench: () => () => {}, showLauncher: () => {}, launch: async () => {}, activateInstance: () => {},
      activateGroup: () => {}, pinInstance: () => {}, closeInstance: async () => {}, retryRestore: async () => {},
      moveInstance: () => {}, setGroupTabOrientation: () => {}, setGroupVerticalRailWidth: () => {},
      setDefaultTabOrientation: () => {}, setSplitRatio: () => {},
      t: (key: string) => copy[key] ?? key,
    }
    const pending = render(<RightSidebarPanel {...({
      ...props, renderSlot: () => <Pending />,
    } as unknown as RightSidebarPanelProps)} />)
    expect(pending.getByRole('status').textContent).toContain('Loading')
    pending.unmount()
    function Failure(): never { throw new Error('fixture') }
    const failed = render(<RightSidebarPanel {...({
      ...props, renderSlot: () => <Failure />,
    } as unknown as RightSidebarPanelProps)} />)
    expect(failed.getByRole('alert').textContent).toContain('could not be displayed')
    report.mockRestore()
  })
})

describe('RightSidebarToggle', () => {
  it('keeps Host-owned open and maximize controls unchanged', () => {
    const toggleDetails = vi.fn()
    const toggleDetailsMaximized = vi.fn()
    const view = render(<RightSidebarToggle {...({
      detailsOpen: true,
      detailsMaximized: false,
      toggleDetails,
      toggleDetailsMaximized,
      t: (key: string) => copy[key] ?? key,
    } as unknown as RightSidebarToggleProps)} />)
    fireEvent.click(view.getByRole('button', { name: 'Maximize sidebar' }))
    fireEvent.click(view.getByRole('button', { name: 'Close sidebar' }))
    expect(toggleDetailsMaximized).toHaveBeenCalledOnce()
    expect(toggleDetails).toHaveBeenCalledWith(true)
    expect(PANEL_CSS).toContain('width:32px;height:32px;padding:0;border:none')
    expect(PANEL_CSS).toContain(".dsh-rightbar-toggle[data-active='true']")
  })
})

function dataTransfer(initial: Readonly<Record<string, string>> = {}): DataTransfer {
  const values = new Map(Object.entries(initial))
  const types = [...values.keys()]
  return {
    effectAllowed: 'all',
    dropEffect: 'none',
    files: [],
    items: [],
    types,
    setData: vi.fn((format: string, value: string) => {
      values.set(format, value)
      if (!types.includes(format)) types.push(format)
    }),
    getData: vi.fn((format: string) => values.get(format) ?? ''),
  } as unknown as DataTransfer
}

function setRect(element: HTMLElement, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): void {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...rect, x: rect.left, y: rect.top, right: rect.left + rect.width, bottom: rect.top + rect.height,
    toJSON: () => {},
  })
}

function dragAt(type: 'dragOver' | 'drop', target: HTMLElement, transfer: DataTransfer, x: number, y: number): void {
  const event = createEvent[type](target, { dataTransfer: transfer })
  Object.defineProperties(event, { clientX: { value: x }, clientY: { value: y } })
  fireEvent(target, event)
}
