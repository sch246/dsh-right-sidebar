// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index'
import type { PanelInjected } from '../src/client/contract'
import { groupsOf } from '../src/client/layout'
import {
  editor, preview, rightbarConsumer, type RightbarConsumerEvent,
} from './fixtures/rightbar-consumer'

it('carries an external consumer through the stable workbench lifecycle', async () => {
  localStorage.clear()
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
    openDetails: () => {}, closeDetails: () => {}, toggleDetailsMaximized: () => {},
  } as never)

  const events: RightbarConsumerEvent[] = []
  const consumer = ctx.plugin(rightbarConsumer(events))
  const shell = ctx.plugin({ inject: [...inject], apply })
  await Promise.all([consumer.await(), shell.await()])

  expect(slots.entries('rightbar.view').map(entry => ({
    id: entry.options.id,
    component: entry.component,
  }))).toEqual([
    { id: 'editor', component: editor },
    { id: 'preview', component: preview },
  ])
  expect(events).toEqual([{ kind: 'attach' }])

  const details = slots.entries('details').find(entry => entry.options.priority === -1)
  if (details === undefined) throw new Error('fixture: details entry is absent')
  const panel = (details.inject as unknown as (sessionId: string) => PanelInjected)('session-1')
  const unmount = panel.mountWorkbench()
  await ctx.rightSidebar.launch('session-1', 'editor', 'draft')
  expect(groupsOf(panel.hooks.workbench.getSnapshot().root)[0]).toMatchObject({
    activeInstanceId: 'editor:draft',
    instances: [{ id: 'editor:draft', viewId: 'editor', title: 'Editor draft' }],
  })
  expect(events.at(-1)).toEqual({ kind: 'launch', selection: 'draft' })
  unmount()

  await shell.dispose()
  expect(slots.spec('rightbar.view')).toBeUndefined()
  expect(events.at(-1)).toEqual({ kind: 'detach' })

  const remounted = ctx.plugin({ inject: [...inject], apply })
  await remounted.await()
  expect(slots.entries('rightbar.view').map(entry => entry.options.id)).toEqual(['editor', 'preview'])
  expect(events.at(-1)).toEqual({ kind: 'attach' })

  await consumer.dispose()
  expect(slots.entries('rightbar.view')).toEqual([])
  expect(events.at(-1)).toEqual({ kind: 'detach' })
  await remounted.dispose()
  disposeRoot()
  await slotsFiber.dispose()
})
