// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import {
  apply, inject, RightSidebarOpenTabError, type RightSidebarService,
} from '../src/client/index'
import type { PanelInjected } from '../src/client/contract'
import { createRightSidebarStore } from '../src/client/stores'

type RightSidebarInstance = ReturnType<ReturnType<typeof createRightSidebarStore>['create']>
type RightSidebarActions = RightSidebarInstance['actions']

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
  const layout = { openDetails: vi.fn(), closeDetails: vi.fn(), toggleSidebar: vi.fn() }
  ctx.provide('layout', layout as never)
  let shell = ctx.plugin({ inject: [...inject], apply })
  await shell.await()

  const registerTab = (id: string) => slots.register({
    name: 'rightbar.tab', id, label: id, order: 0,
  }, (() => null) as never)

  const mountSession = (sessionId: string) => {
    const entry = slots.entries('details').find(candidate => candidate.options.priority === -1)
    if (entry === undefined) throw new Error('fixture: right-sidebar details entry is absent')
    const instance = createRightSidebarStore().create(sessionId)
    const injected = (entry.inject as unknown as (
      id: string,
      actions: RightSidebarActions,
    ) => PanelInjected)(sessionId, instance.actions)
    return {
      instance,
      injected,
      unmount: injected.mountOpenTabApi(),
    }
  }

  return {
    ctx,
    slots,
    layout,
    registerTab,
    mountSession,
    service: (): RightSidebarService => ctx.rightSidebar,
    disposeShell: async () => { await shell.dispose() },
    remountShell: async () => {
      shell = ctx.plugin({ inject: [...inject], apply })
      await shell.await()
    },
    dispose: async () => {
      await shell.dispose()
      disposeRoot()
      await slotsFiber.dispose()
    },
  }
}

function expectOpenTabError(action: () => void, code: RightSidebarOpenTabError['code']): void {
  try {
    action()
  } catch (error) {
    expect(error).toBeInstanceOf(RightSidebarOpenTabError)
    expect(error).toMatchObject({ code })
    return
  }
  throw new Error(`fixture: expected ${code}`)
}

describe('ctx.rightSidebar.openTab', () => {
  it('selects a live tab before opening the details column', async () => {
    const bench = await createBench()
    const disposeTab = bench.registerTab('outline')
    const mounted = bench.mountSession('session-1')
    expect(Object.keys(bench.service())).toEqual(['openTab'])
    expect(Object.isFrozen(bench.service())).toBe(true)
    bench.layout.openDetails.mockImplementation(() => {
      expect(mounted.instance.getSnapshot().activeTab).toBe('outline')
    })

    expect(bench.service().openTab('session-1', 'outline')).toBeUndefined()
    expect(mounted.instance.getSnapshot().activeTab).toBe('outline')
    expect(bench.layout.openDetails).toHaveBeenCalledOnce()

    mounted.unmount()
    disposeTab()
    await bench.dispose()
  })

  it('rejects an unknown tab without changing selection or layout', async () => {
    const bench = await createBench()
    const disposeTab = bench.registerTab('files')
    const mounted = bench.mountSession('session-1')
    mounted.instance.actions.setActiveTab('files')

    expectOpenTabError(
      () => { bench.service().openTab('session-1', 'ghost') },
      'unknown-tab',
    )
    expect(mounted.instance.getSnapshot().activeTab).toBe('files')
    expect(bench.layout.openDetails).not.toHaveBeenCalled()

    mounted.unmount()
    disposeTab()
    await bench.dispose()
  })

  it('rejects absent and mismatched mounted sessions before writes', async () => {
    const bench = await createBench()
    const disposeTab = bench.registerTab('files')
    const service = bench.service()

    expectOpenTabError(() => { service.openTab('session-1', 'files') }, 'not-mounted')
    const mounted = bench.mountSession('session-1')
    expectOpenTabError(() => { service.openTab('session-2', 'files') }, 'session-mismatch')
    expect(mounted.instance.getSnapshot().activeTab).toBe('')
    expect(bench.layout.openDetails).not.toHaveBeenCalled()

    mounted.unmount()
    expectOpenTabError(() => { service.openTab('session-1', 'files') }, 'not-mounted')
    disposeTab()
    await bench.dispose()
  })

  it('invalidates replaced, unmounted, and disposed action bindings', async () => {
    const bench = await createBench()
    const disposeTab = bench.registerTab('files')
    const oldService = bench.service()
    const first = bench.mountSession('session-1')
    const second = bench.mountSession('session-2')

    first.unmount()
    oldService.openTab('session-2', 'files')
    expect(first.instance.getSnapshot().activeTab).toBe('')
    expect(second.instance.getSnapshot().activeTab).toBe('files')
    expectOpenTabError(() => { oldService.openTab('session-1', 'files') }, 'session-mismatch')

    await bench.disposeShell()
    expectOpenTabError(() => { oldService.openTab('session-2', 'files') }, 'not-mounted')
    expectOpenTabError(() => { first.injected.mountOpenTabApi() }, 'not-mounted')

    await bench.remountShell()
    const newService = bench.service()
    expect(newService).not.toBe(oldService)
    const disposeRemountedTab = bench.registerTab('files')
    const remounted = bench.mountSession('session-1')
    newService.openTab('session-1', 'files')
    expect(remounted.instance.getSnapshot().activeTab).toBe('files')
    expectOpenTabError(() => { oldService.openTab('session-1', 'files') }, 'not-mounted')

    second.unmount()
    remounted.unmount()
    disposeRemountedTab()
    disposeTab()
    await bench.dispose()
  })
})
