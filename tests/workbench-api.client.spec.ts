// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply, inject, RightSidebarError, type RightSidebarService } from '../src/client/index'
import type { PanelInjected, RightSidebarGroup, RightSidebarSplit } from '../src/client/contract'
import { groupsOf } from '../src/client/layout'

const STORAGE_KEY = '@dsh-external/dsh-right-sidebar/workbench/1'
const cleanups = new Set<() => Promise<void>>()

beforeEach(() => { localStorage.clear() })
afterEach(async () => { await Promise.all([...cleanups].map(dispose => dispose())) })

async function createBench() {
  const ctx = new Context()
  const slotsFiber = ctx.plugin(SlotRegistry)
  await slotsFiber.await()
  const slots = ctx.get('slots') as SlotRegistry
  const disposeRoot = slots.register({
    name: 'root',
    children: {
      details: { kind: 'single', scope: 'session' },
      'shell.navbar.action': { kind: 'list', scope: 'root' },
    },
  }, (() => null) as never)
  ctx.provide('locale', new LocaleRuntime(ctx))
  const layout = { openDetails: vi.fn(), closeDetails: vi.fn(), toggleDetailsMaximized: vi.fn() }
  ctx.provide('layout', layout as never)
  let shell = ctx.plugin({ inject: [...inject], apply })
  await shell.await()
  const registerView = (id: string) => slots.register({ name: 'rightbar.view', id }, (() => null) as never)
  const face = (sessionId: string): PanelInjected => {
    const entry = slots.entries('details').find(candidate => candidate.options.priority === -1)
    if (entry === undefined) throw new Error('fixture: details entry is absent')
    return (entry.inject as unknown as (id: string) => PanelInjected)(sessionId)
  }
  let cleaned = false
  const dispose = async (): Promise<void> => {
    if (cleaned) return
    cleaned = true
    cleanups.delete(dispose)
    await shell.dispose()
    disposeRoot()
    await slotsFiber.dispose()
  }
  cleanups.add(dispose)
  return {
    ctx, slots, layout, registerView, face,
    service: (): RightSidebarService => ctx.rightSidebar,
    disposeShell: async () => { await shell.dispose() },
    remountShell: async () => {
      shell = ctx.plugin({ inject: [...inject], apply })
      await shell.await()
    },
    dispose,
  }
}

function expectCode(action: () => unknown, code: RightSidebarError['code']): void {
  expect(action).toThrowError(expect.objectContaining({ code }))
}

function group(panel: PanelInjected, instanceId: string): RightSidebarGroup {
  const value = groupsOf(panel.hooks.workbench.getSnapshot().root)
    .find(candidate => candidate.instances.some(instance => instance.id === instanceId))
  if (value === undefined) throw new Error(`fixture: group for ${instanceId} is absent`)
  return value
}

describe('ctx.rightSidebar grouped workbench', () => {
  it('opens into deterministic groups and exposes the frozen public API', async () => {
    const bench = await createBench()
    const disposeEditor = bench.registerView('editor')
    const disposePreview = bench.registerView('preview')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()

    expect(Object.keys(bench.service())).toEqual([
      'registerLauncher', 'registerRestorer', 'launch', 'openInstance', 'getInstanceGroup',
      'resolveTarget', 'activateInstance', 'pinInstance', 'updateInstance', 'switchInstanceView',
      'closeInstance',
    ])
    expect(Object.isFrozen(bench.service())).toBe(true)

    const rootGroup = await bench.service().openInstance('session-1', {
      id: 'tree', viewId: 'editor', title: 'Tree', restoreDescriptor: { root: '/' },
    })
    const rightGroup = await bench.service().openInstance('session-1', {
      id: 'file:a', viewId: 'editor', title: 'A', restoreDescriptor: { file: 'a' },
    }, { target: { fromInstanceId: 'tree', direction: 'right' }, preview: true })
    await bench.service().openInstance('session-1', {
      id: 'file:b', viewId: 'editor', title: 'B', restoreDescriptor: { file: 'b' },
    }, { target: { fromInstanceId: 'tree', direction: 'right' } })

    expect(rightGroup).not.toBe(rootGroup)
    expect(bench.service().getInstanceGroup('session-1', 'file:a')).toBe(rightGroup)
    expect(bench.service().resolveTarget('session-1', {
      fromInstanceId: 'tree', direction: 'right',
    })).toBe(rightGroup)
    expect(group(panel, 'file:a').instances.map(instance => instance.id)).toEqual(['file:a', 'file:b'])

    bench.service().pinInstance('session-1', 'file:a')
    bench.service().updateInstance('session-1', 'file:a', { title: 'A renamed' })
    bench.service().switchInstanceView('session-1', 'file:a', {
      viewId: 'preview', title: 'A image', restoreDescriptor: { file: 'a', handler: 'image' },
    })
    expect(group(panel, 'file:a').instances[0]).toMatchObject({
      id: 'file:a', viewId: 'preview', title: 'A image', preview: false,
    })
    expect(bench.layout.openDetails).toHaveBeenCalledTimes(3)

    unmount()
    disposePreview()
    disposeEditor()
    await bench.dispose()
  })

  it('cancels vetoed preview replacement and lets the newest concurrent open win', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    const previewClosed = vi.fn()
    await bench.service().openInstance('session-1', {
      id: 'preview', viewId: 'editor', title: 'Preview', onClose: () => false,
      onClosed: previewClosed,
    }, { preview: true })
    await expect(bench.service().openInstance('session-1', {
      id: 'blocked', viewId: 'editor', title: 'Blocked',
    }, { preview: true })).rejects.toMatchObject({ code: 'preview-vetoed' })
    expect(previewClosed).not.toHaveBeenCalled()
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]?.instances.map(row => row.id)).toEqual(['preview'])

    let finish: ((value: boolean) => void) | undefined
    bench.service().switchInstanceView('session-1', 'preview', {
      viewId: 'editor', onClose: () => new Promise(resolve => { finish = resolve }),
      onClosed: previewClosed,
    })
    const older = bench.service().openInstance('session-1', {
      id: 'older', viewId: 'editor', title: 'Older',
    }, { preview: true })
    const newer = bench.service().openInstance('session-1', {
      id: 'newer', viewId: 'editor', title: 'Newer',
    }, { preview: true })
    await Promise.resolve()
    finish?.(true)
    await expect(older).rejects.toMatchObject({ code: 'superseded' })
    await expect(newer).resolves.toBe(group(panel, 'newer').id)
    expect(previewClosed).toHaveBeenCalledOnce()
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]?.instances.map(row => row.id)).toEqual(['newer'])

    let finishCheckpoint: ((value: boolean) => void) | undefined
    const checkpointClosed = vi.fn()
    bench.service().switchInstanceView('session-1', 'newer', {
      viewId: 'editor', onClose: () => new Promise(resolve => { finishCheckpoint = resolve }),
      onClosed: checkpointClosed,
    })
    const checkpointReplacement = bench.service().openInstance('session-1', {
      id: 'after-checkpoint', viewId: 'editor', title: 'After checkpoint',
    }, { preview: true })
    await Promise.resolve()
    bench.service().updateInstance('session-1', 'newer', {
      restoreDescriptor: { revision: 2 },
    })
    finishCheckpoint?.(true)
    await expect(checkpointReplacement).rejects.toMatchObject({ code: 'superseded' })
    expect(checkpointClosed).not.toHaveBeenCalled()
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]?.instances.map(row => row.id)).toEqual(['newer'])

    let finishReopen: ((value: boolean) => void) | undefined
    const reopenedPreviewClosed = vi.fn()
    bench.service().switchInstanceView('session-1', 'newer', {
      viewId: 'editor', onClose: () => new Promise(resolve => { finishReopen = resolve }),
      onClosed: reopenedPreviewClosed,
    })
    const pendingReplacement = bench.service().openInstance('session-1', {
      id: 'replacement', viewId: 'editor', title: 'Replacement',
    }, { preview: true })
    await Promise.resolve()
    await bench.service().openInstance('session-1', {
      id: 'newer', viewId: 'editor', title: 'Ignored',
    }, { preview: true })
    finishReopen?.(true)
    await expect(pendingReplacement).rejects.toMatchObject({ code: 'superseded' })
    expect(reopenedPreviewClosed).not.toHaveBeenCalled()
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]?.instances.map(row => row.id)).toEqual(['newer'])

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('coalesces close decisions and protects updated and reopened identities', async () => {
    const bench = await createBench()
    let disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    let finish: ((value: boolean) => void) | undefined
    const decide = vi.fn(() => new Promise<boolean>(resolve => { finish = resolve }))
    const staleClosed = vi.fn()
    await bench.service().openInstance('session-1', {
      id: 'same', viewId: 'editor', title: 'Old', onClose: decide, onClosed: staleClosed,
    })
    const first = bench.service().closeInstance('session-1', 'same')
    const second = bench.service().closeInstance('session-1', 'same')
    await Promise.resolve()
    expect(decide).toHaveBeenCalledOnce()
    bench.service().updateInstance('session-1', 'same', { title: 'Updated' })
    finish?.(true)
    await Promise.all([first, second])
    expect(staleClosed).not.toHaveBeenCalled()
    expect(group(panel, 'same').instances[0]?.title).toBe('Updated')

    disposeView()
    expect(group(panel, 'same').instances[0]?.availability).toBe('missing')
    disposeView = bench.registerView('editor')
    bench.service().switchInstanceView('session-1', 'same', { viewId: 'editor', title: 'Reopened' })
    expect(group(panel, 'same').instances[0]).toMatchObject({ title: 'Reopened', availability: 'ready' })

    let finishReopen: ((value: boolean) => void) | undefined
    const reopenedClosed = vi.fn()
    bench.service().switchInstanceView('session-1', 'same', {
      viewId: 'editor', onClose: () => new Promise(resolve => { finishReopen = resolve }),
      onClosed: reopenedClosed,
    })
    const staleClose = bench.service().closeInstance('session-1', 'same')
    await Promise.resolve()
    await bench.service().openInstance('session-1', { id: 'same', viewId: 'editor', title: 'Ignored' })
    finishReopen?.(true)
    await staleClose
    expect(reopenedClosed).not.toHaveBeenCalled()
    expect(group(panel, 'same').instances[0]?.id).toBe('same')

    const committedClosed = vi.fn()
    await bench.service().openInstance('session-1', {
      id: 'committed', viewId: 'editor', title: 'Committed', onClosed: committedClosed,
    })
    await bench.service().closeInstance('session-1', 'committed')
    expect(committedClosed).toHaveBeenCalledOnce()

    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    const cleanupFailure = new Error('cleanup failed')
    await bench.service().openInstance('session-1', {
      id: 'cleanup-failure', viewId: 'editor', title: 'Cleanup failure',
      onClosed: () => { throw cleanupFailure },
    })
    await bench.service().closeInstance('session-1', 'cleanup-failure')
    expectCode(() => bench.service().getInstanceGroup('session-1', 'cleanup-failure'), 'unknown-instance')
    expect(report).toHaveBeenCalledWith(
      'right-sidebar: onClosed notification failed for instance "cleanup-failure":', cleanupFailure,
    )
    report.mockRestore()

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('moves, reorders and edge-splits tabs while collapsing empty source groups', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    await bench.service().openInstance('session-1', { id: 'a', viewId: 'editor', title: 'A' })
    await bench.service().openInstance('session-1', { id: 'b', viewId: 'editor', title: 'B' })
    const original = bench.service().getInstanceGroup('session-1', 'a')
    panel.moveInstance('b', { groupId: original, direction: 'center', index: 0 })
    expect(group(panel, 'a').instances.map(row => row.id)).toEqual(['b', 'a'])
    panel.moveInstance('b', { groupId: original, direction: 'center', index: 2 })
    expect(group(panel, 'a').instances.map(row => row.id)).toEqual(['a', 'b'])

    panel.moveInstance('a', { groupId: original, direction: 'right' })
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)).toHaveLength(2)
    expect(bench.service().getInstanceGroup('session-1', 'a')).not.toBe(original)
    const aGroup = bench.service().getInstanceGroup('session-1', 'a')
    panel.moveInstance('a', { groupId: aGroup, direction: 'left' })
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)).toHaveLength(2)
    panel.moveInstance('a', { groupId: original, direction: 'center' })
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)).toHaveLength(1)
    panel.setDefaultTabOrientation('vertical')
    await bench.service().openInstance('session-1', { id: 'c', viewId: 'editor', title: 'C' }, {
      target: { fromInstanceId: 'b', direction: 'down' },
    })
    expect(group(panel, 'c').tabOrientation).toBe('vertical')

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('preserves the active group when closing an inactive group\'s last tab', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    await bench.service().openInstance('session-1', { id: 'a', viewId: 'editor', title: 'A' })
    await bench.service().openInstance('session-1', { id: 'b', viewId: 'editor', title: 'B' }, {
      target: { fromInstanceId: 'a', direction: 'right' },
    })
    await bench.service().openInstance('session-1', { id: 'c', viewId: 'editor', title: 'C' }, {
      target: { fromInstanceId: 'b', direction: 'right' },
    })
    const middleGroup = bench.service().getInstanceGroup('session-1', 'b')
    bench.service().activateInstance('session-1', 'b')
    await bench.service().closeInstance('session-1', 'c')
    expect(panel.hooks.workbench.getSnapshot().activeGroupId).toBe(middleGroup)
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)).toHaveLength(2)

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('persists layout and restores feature state without deleting unavailable tabs', async () => {
    const first = await createBench()
    const disposeView = first.registerView('editor')
    const panel = first.face('session-persisted')
    const unmount = panel.mountWorkbench()
    await first.service().openInstance('session-persisted', {
      id: 'tree', viewId: 'editor', title: 'Tree', restoreDescriptor: { kind: 'tree' },
    })
    await first.service().openInstance('session-persisted', {
      id: 'doc', viewId: 'editor', title: 'Doc', restoreDescriptor: { kind: 'doc' },
    }, { target: { fromInstanceId: 'tree', direction: 'right' }, preview: true })
    first.service().updateInstance('session-persisted', 'doc', {
      restoreDescriptor: { kind: 'doc', expanded: ['src'] },
    })
    const docGroup = first.service().getInstanceGroup('session-persisted', 'doc')
    panel.setGroupTabOrientation(docGroup, 'vertical')
    panel.setGroupVerticalRailWidth(docGroup, 347)
    panel.setDefaultTabOrientation('vertical')
    const root = panel.hooks.workbench.getSnapshot().root as RightSidebarSplit
    panel.setSplitRatio(root.id, 0.72)
    unmount()
    disposeView()
    await first.dispose()

    const second = await createBench()
    const restoredPanel = second.face('session-persisted')
    const unmountRestored = restoredPanel.mountWorkbench()
    expect(group(restoredPanel, 'doc')).toMatchObject({ tabOrientation: 'vertical', verticalRailWidth: 347 })
    expect(group(restoredPanel, 'doc').instances[0]).toMatchObject({ availability: 'missing', preview: true })
    expect((restoredPanel.hooks.workbench.getSnapshot().root as RightSidebarSplit).ratio).toBe(0.72)

    const disposeRestoredView = second.registerView('editor')
    const restore = vi.fn(async ({ descriptor }: { descriptor: unknown }) => {
      expect(descriptor).toBeTruthy()
      return { onClose: () => true }
    })
    const disposeRestorer = second.service().registerRestorer('editor', restore)
    await vi.waitFor(() => {
      expect(group(restoredPanel, 'doc').instances[0]?.availability).toBe('ready')
    })
    expect(restore).toHaveBeenCalledTimes(2)
    expect(restore).toHaveBeenCalledWith(expect.objectContaining({
      instanceId: 'doc', descriptor: { kind: 'doc', expanded: ['src'] },
    }))

    disposeRestorer()
    expect(group(restoredPanel, 'doc').instances[0]?.availability).toBe('missing')
    expect(groupsOf(restoredPanel.hooks.workbench.getSnapshot().root)).toHaveLength(2)
    unmountRestored()
    disposeRestoredView()
    await second.dispose()
  })

  it('keeps failed restoration retryable and enforces one restorer per view', async () => {
    const first = await createBench()
    const disposeFirstView = first.registerView('editor')
    const firstPanel = first.face('restore-failure')
    const unmountFirst = firstPanel.mountWorkbench()
    await first.service().openInstance('restore-failure', {
      id: 'doc', viewId: 'editor', title: 'Doc', restoreDescriptor: { id: 'doc' },
    })
    unmountFirst()
    disposeFirstView()
    await first.dispose()

    const second = await createBench()
    const disposeView = second.registerView('editor')
    const panel = second.face('restore-failure')
    const unmount = panel.mountWorkbench()
    let failing = true
    const restore = vi.fn(async () => {
      if (failing) throw new Error('fixture restore failure')
    })
    const disposeRestorer = second.service().registerRestorer('editor', restore)
    expectCode(() => second.service().registerRestorer('editor', () => {}), 'duplicate-restorer')
    await vi.waitFor(() => { expect(group(panel, 'doc').instances[0]?.availability).toBe('failed') })
    failing = false
    await panel.retryRestore('doc')
    expect(group(panel, 'doc').instances[0]?.availability).toBe('ready')
    expect(restore).toHaveBeenCalledTimes(2)

    disposeRestorer()
    unmount()
    disposeView()
    await second.dispose()
  })

  it('rejects corrupt persisted duplicate ids and multiple previews as one damaged snapshot', async () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {})
    const invalidGroup = {
      kind: 'group', id: 'group-1', tabOrientation: 'horizontal', verticalRailWidth: 180,
      activeInstanceId: 'same',
      instances: [
        { id: 'same', viewId: 'editor', title: 'A', preview: true },
        { id: 'same', viewId: 'editor', title: 'B', preview: true },
      ],
    }
    const raw = JSON.stringify({
      version: 1,
      sessions: { damaged: { root: invalidGroup, activeGroupId: 'group-1', defaultTabOrientation: 'horizontal' } },
    })
    localStorage.setItem(STORAGE_KEY, raw)
    const bench = await createBench()
    const panel = bench.face('damaged')
    expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]?.instances).toEqual([])
    expect(report).toHaveBeenCalledWith(
      'right-sidebar: persisted workbench was rejected; original retained at @dsh-external/dsh-right-sidebar/workbench/1-invalid-backup:', expect.any(Error),
    )
    expect(localStorage.getItem(`${STORAGE_KEY}-invalid-backup`)).toBe(raw)
    await bench.dispose()
  })

  it('validates before writes and invalidates replaced bindings and services', async () => {
    const bench = await createBench()
    const panel = bench.face('session-1')
    await expect(bench.service().openInstance('session-1', {
      id: 'a', viewId: 'missing', title: 'A',
    })).rejects.toMatchObject({ code: 'not-mounted' })
    const unmount = panel.mountWorkbench()
    await expect(bench.service().openInstance('session-2', {
      id: 'a', viewId: 'missing', title: 'A',
    })).rejects.toMatchObject({ code: 'session-mismatch' })
    await expect(bench.service().openInstance('session-1', {
      id: 'a', viewId: 'missing', title: 'A',
    })).rejects.toMatchObject({ code: 'unknown-view' })
    const disposeView = bench.registerView('editor')
    await expect(bench.service().openInstance('session-1', {
      id: 'bad', viewId: 'editor', title: 'Bad', restoreDescriptor: () => {},
    })).rejects.toMatchObject({ code: 'invalid-restore-descriptor' })
    await bench.service().openInstance('session-1', {
      id: 'good', viewId: 'editor', title: 'Good', restoreDescriptor: { version: 1 },
    })
    expectCode(() => bench.service().updateInstance('session-1', 'good', {
      restoreDescriptor: Symbol('bad'),
    }), 'invalid-restore-descriptor')
    expect(group(panel, 'good').instances[0]?.title).toBe('Good')
    expectCode(() => bench.service().resolveTarget('session-1', { groupId: 'missing' }), 'unknown-group')
    expectCode(() => bench.service().activateInstance('session-1', 'missing'), 'unknown-instance')

    const oldService = bench.service()
    const replacement = bench.face('session-2')
    const unmountReplacement = replacement.mountWorkbench()
    expectCode(() => panel.showLauncher(), 'not-mounted')
    await bench.disposeShell()
    await expect(oldService.openInstance('session-2', {
      id: 'late', viewId: 'editor', title: 'Late',
    })).rejects.toMatchObject({ code: 'disposed' })
    expectCode(() => replacement.mountWorkbench(), 'disposed')

    unmount()
    unmountReplacement()
    disposeView()
    await bench.dispose()
  })
})
