// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { Context } from 'cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { DshBrowserUiRuntime } from '@dsh-std/adapter-dsh/client'
import { apply, inject } from '../src/client/index'
import { portableSidebarFixture, type PortableSidebarEvent } from './fixtures/portable-sidebar-component'

it('carries a portable SidebarView through adapter-dsh into the real shell owner', async () => {
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
  ctx.provide('layout', {
    toggleSidebar: vi.fn(), openDetails: vi.fn(), closeDetails: vi.fn(),
  } as never)

  const events: PortableSidebarEvent[] = []
  const fixture = portableSidebarFixture(events)
  const runtime = new DshBrowserUiRuntime(ctx as never)
  const disposeFixture = await runtime.mountFacet({
    manifest: fixture.manifest,
    facet: 'web',
    module: fixture.module,
  })
  expect(slots.entries('rightbar.tab')).toEqual([])

  const shell = ctx.plugin({ inject: [...inject], apply })
  await shell.await()
  const firstEntries = slots.entries('rightbar.tab')
  expect(firstEntries.map(entry => ({
    label: entry.options.label,
    component: entry.component,
  }))).toEqual([
    { label: 'Outline', component: fixture.outline },
    { label: 'History', component: fixture.history },
  ])
  const firstIds = firstEntries.map(entry => entry.options.id)
  const firstInstances = events.filter(event => event.kind === 'create').map(event => event.context.instanceId)

  await shell.dispose()
  expect(slots.spec('rightbar.tab')).toBeUndefined()
  await vi.waitFor(() => { expect(events.filter(event => event.kind === 'dispose')).toHaveLength(2) })

  const remounted = ctx.plugin({ inject: [...inject], apply })
  await remounted.await()
  expect(slots.entries('rightbar.tab').map(entry => entry.options.id)).not.toEqual(firstIds)
  expect(events.filter(event => event.kind === 'create').slice(-2).map(event => event.context.instanceId))
    .not.toEqual(firstInstances)

  await disposeFixture()
  expect(slots.entries('rightbar.tab')).toEqual([])
  expect(events.filter(event => event.kind === 'abort')).toHaveLength(4)
  expect(events.filter(event => event.kind === 'dispose')).toHaveLength(4)
  await remounted.dispose()
  disposeRoot()
  await slotsFiber.dispose()
})
