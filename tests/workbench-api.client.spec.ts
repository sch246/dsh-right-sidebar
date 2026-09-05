// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import {
  apply, inject, RightSidebarError, type RightSidebarService,
} from '../src/client/index'
import type { PanelInjected } from '../src/client/contract'

const benchCleanups = new Set<() => Promise<void>>()

afterEach(async () => {
  await Promise.all([...benchCleanups].map(dispose => dispose()))
})

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
    benchCleanups.delete(dispose)
    await shell.dispose()
    disposeRoot()
    await slotsFiber.dispose()
  }
  benchCleanups.add(dispose)

  return {
    ctx,
    layout,
    registerView,
    face,
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

describe('ctx.rightSidebar workbench', () => {
  it('launches, opens ordered instances, deduplicates, activates, and updates', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    const open = vi.fn((sessionId: string, selection?: unknown) => {
      bench.service().openInstance(sessionId, {
        id: `editor:${String(selection)}`, viewId: 'editor', title: 'Draft',
      })
    })
    const disposeLauncher = bench.service().registerLauncher({ id: 'editor', label: 'Editor', open })

    expect(Object.keys(bench.service())).toEqual([
      'registerLauncher', 'launch', 'openInstance', 'activateInstance', 'updateInstance', 'closeInstance',
    ])
    expect(Object.isFrozen(bench.service())).toBe(true)
    await bench.service().launch('session-1', 'editor', 'a')
    bench.service().openInstance('session-1', { id: 'editor:b', viewId: 'editor', title: 'B' })
    bench.service().openInstance('session-1', { id: 'editor:a', viewId: 'editor', title: 'Ignored' })
    bench.service().updateInstance('session-1', 'editor:a', { title: 'A' })

    expect(open).toHaveBeenCalledWith('session-1', 'a')
    expect(panel.hooks.workbench.getSnapshot()).toMatchObject({
      activeInstanceId: 'editor:a',
      instances: [
        { id: 'editor:a', viewId: 'editor', title: 'A' },
        { id: 'editor:b', viewId: 'editor', title: 'B' },
      ],
    })
    expect(bench.layout.openDetails).toHaveBeenCalledTimes(3)

    disposeLauncher()
    expect(panel.hooks.launchers.getSnapshot()).toEqual([])
    unmount()
    disposeView()
    await bench.dispose()
  })

  it('validates mount, session, launcher, view, and instance before writes', async () => {
    const bench = await createBench()
    const panel = bench.face('session-1')
    expectCode(() => bench.service().openInstance('session-1', {
      id: 'a', viewId: 'missing', title: 'A',
    }), 'not-mounted')
    const unmount = panel.mountWorkbench()
    expectCode(() => bench.service().openInstance('session-2', {
      id: 'a', viewId: 'missing', title: 'A',
    }), 'session-mismatch')
    expectCode(() => bench.service().openInstance('session-1', {
      id: 'a', viewId: 'missing', title: 'A',
    }), 'unknown-view')
    await expect(bench.service().launch('session-1', 'missing')).rejects.toMatchObject({ code: 'unknown-launcher' })
    expectCode(() => bench.service().activateInstance('session-1', 'missing'), 'unknown-instance')
    expectCode(() => bench.service().updateInstance('missing-session', 'missing', { title: 'Nope' }), 'unknown-instance')
    expectCode(() => { void bench.service().closeInstance('missing-session', 'missing') }, 'unknown-instance')
    expect(bench.layout.openDetails).not.toHaveBeenCalled()
    expect(panel.hooks.workbench.getSnapshot()).toEqual({ instances: [], activeInstanceId: undefined })
    unmount()
    await bench.dispose()
  })

  it('retains isolated session ledgers when the mounted occurrence changes', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const first = bench.face('session-1')
    const unmountFirst = first.mountWorkbench()
    bench.service().openInstance('session-1', { id: 'a', viewId: 'editor', title: 'A' })
    const second = bench.face('session-2')
    const unmountSecond = second.mountWorkbench()
    bench.service().openInstance('session-2', { id: 'b', viewId: 'editor', title: 'B' })

    expect(first.hooks.workbench.getSnapshot().instances.map(row => row.id)).toEqual(['a'])
    expect(second.hooks.workbench.getSnapshot().instances.map(row => row.id)).toEqual(['b'])
    expectCode(() => first.activateInstance('a'), 'not-mounted')

    unmountFirst()
    unmountSecond()
    const remountFirst = first.mountWorkbench()
    expect(first.hooks.workbench.getSnapshot()).toMatchObject({
      activeInstanceId: 'a', instances: [{ id: 'a' }],
    })
    remountFirst()
    disposeView()
    await bench.dispose()
  })

  it('honors close vetoes, deduplicates one close, and ignores stale completion', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    bench.service().openInstance('session-1', {
      id: 'vetoed', viewId: 'editor', title: 'Vetoed', onClose: () => false,
    })
    await bench.service().closeInstance('session-1', 'vetoed')
    expect(panel.hooks.workbench.getSnapshot().instances.map(row => row.id)).toEqual(['vetoed'])

    let finishClose: ((result: boolean) => void) | undefined
    const onClose = vi.fn(() => new Promise<boolean>(resolve => { finishClose = resolve }))
    bench.service().openInstance('session-1', {
      id: 'pending', viewId: 'editor', title: 'Pending', onClose,
    })
    const closing = bench.service().closeInstance('session-1', 'pending')
    const duplicateClose = bench.service().closeInstance('session-1', 'pending')
    expect(duplicateClose).toBe(closing)
    await Promise.resolve()
    expect(onClose).toHaveBeenCalledOnce()

    bench.service().updateInstance('session-1', 'pending', { title: 'Changed while closing' })
    finishClose?.(true)
    await closing
    expect(panel.hooks.workbench.getSnapshot().instances).toContainEqual(expect.objectContaining({
      id: 'pending', title: 'Changed while closing',
    }))

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('does not let an old close operation capture a reopened instance id', async () => {
    const bench = await createBench()
    let disposeView = bench.registerView('editor')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    let finishOldClose: ((result: boolean) => void) | undefined
    bench.service().openInstance('session-1', {
      id: 'same',
      viewId: 'editor',
      title: 'Old',
      onClose: () => new Promise(resolve => { finishOldClose = resolve }),
    })
    const oldClose = bench.service().closeInstance('session-1', 'same')

    disposeView()
    expect(panel.hooks.workbench.getSnapshot()).toEqual({ instances: [], activeInstanceId: undefined })
    disposeView = bench.registerView('editor')
    const closeNew = vi.fn(() => true)
    bench.service().openInstance('session-1', {
      id: 'same', viewId: 'editor', title: 'New', onClose: closeNew,
    })
    const newClose = bench.service().closeInstance('session-1', 'same')
    expect(newClose).not.toBe(oldClose)
    await newClose
    expect(closeNew).toHaveBeenCalledOnce()
    finishOldClose?.(true)
    await oldClose
    expect(panel.hooks.workbench.getSnapshot()).toEqual({ instances: [], activeInstanceId: undefined })

    unmount()
    disposeView()
    await bench.dispose()
  })

  it('removes every instance whose live view registration disappears and repairs selection', async () => {
    const bench = await createBench()
    const disposeEditor = bench.registerView('editor')
    const disposePreview = bench.registerView('preview')
    const panel = bench.face('session-1')
    const unmount = panel.mountWorkbench()
    bench.service().openInstance('session-1', { id: 'a', viewId: 'editor', title: 'A' })
    bench.service().openInstance('session-1', { id: 'b', viewId: 'preview', title: 'B' })
    bench.service().openInstance('session-1', { id: 'c', viewId: 'editor', title: 'C' })
    bench.service().activateInstance('session-1', 'a')
    const otherPanel = bench.face('session-2')
    const unmountOther = otherPanel.mountWorkbench()
    bench.service().openInstance('session-2', { id: 'other', viewId: 'editor', title: 'Other' })
    unmountOther()
    const remount = panel.mountWorkbench()

    disposeEditor()
    expect(panel.hooks.workbench.getSnapshot()).toEqual({
      instances: [{ id: 'b', viewId: 'preview', title: 'B' }],
      activeInstanceId: 'b',
    })
    expect(otherPanel.hooks.workbench.getSnapshot()).toEqual({
      instances: [], activeInstanceId: undefined,
    })
    disposePreview()
    expect(panel.hooks.workbench.getSnapshot()).toEqual({ instances: [], activeInstanceId: undefined })

    unmount()
    remount()
    await bench.dispose()
  })

  it('invalidates replaced panel faces and every retained face after disposal', async () => {
    const bench = await createBench()
    const disposeView = bench.registerView('editor')
    const oldService = bench.service()
    const first = bench.face('session-1')
    const unmountFirst = first.mountWorkbench()
    const second = bench.face('session-2')
    const unmountSecond = second.mountWorkbench()

    expectCode(() => first.showLauncher(), 'not-mounted')
    oldService.openInstance('session-2', { id: 'b', viewId: 'editor', title: 'B' })
    await bench.disposeShell()
    expectCode(() => oldService.openInstance('session-2', { id: 'late', viewId: 'editor', title: 'Late' }), 'disposed')
    expectCode(() => second.mountWorkbench(), 'disposed')
    expect(second.hooks.workbench.getSnapshot()).toEqual({ instances: [], activeInstanceId: undefined })

    await bench.remountShell()
    expect(bench.service()).not.toBe(oldService)
    expectCode(() => first.activateInstance('missing'), 'disposed')

    unmountFirst()
    unmountSecond()
    disposeView()
    await bench.dispose()
  })

  it('rejects duplicate launcher ids until the owning registration is disposed', async () => {
    const bench = await createBench()
    const dispose = bench.service().registerLauncher({ id: 'editor', label: 'Editor', open: () => {} })
    expectCode(() => bench.service().registerLauncher({
      id: 'editor', label: 'Other', open: () => {},
    }), 'duplicate-launcher')
    dispose()
    const disposeReplacement = bench.service().registerLauncher({
      id: 'editor', label: 'Replacement', open: () => {},
    })
    disposeReplacement()
    await bench.dispose()
  })
})
