// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { Context } from 'cordis'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { apply, inject } from '../src/client/index'
import {
  history, outline, rightbarConsumer, type RightbarConsumerEvent,
} from './fixtures/rightbar-consumer'

it('carries an external consumer through the stable registration lifecycle', async () => {
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
    toggleSidebar: () => {}, openDetails: () => {}, closeDetails: () => {},
  } as never)

  const events: RightbarConsumerEvent[] = []
  const consumer = ctx.plugin(rightbarConsumer(events))
  await consumer.await()
  expect(slots.entries('rightbar.tab')).toEqual([])

  const shell = ctx.plugin({ inject: [...inject], apply })
  await shell.await()
  expect(slots.entries('rightbar.tab').map(entry => ({
    id: entry.options.id,
    label: entry.options.label,
    component: entry.component,
  }))).toEqual([
    { id: 'outline', label: 'Outline', component: outline },
    { id: 'history', label: 'History', component: history },
  ])
  expect(events).toEqual([{ kind: 'attach' }])

  await shell.dispose()
  expect(slots.spec('rightbar.tab')).toBeUndefined()
  expect(events).toEqual([{ kind: 'attach' }, { kind: 'detach' }])

  const remounted = ctx.plugin({ inject: [...inject], apply })
  await remounted.await()
  expect(slots.entries('rightbar.tab').map(entry => entry.options.id)).toEqual(['outline', 'history'])
  expect(events).toEqual([{ kind: 'attach' }, { kind: 'detach' }, { kind: 'attach' }])

  await consumer.dispose()
  expect(slots.entries('rightbar.tab')).toEqual([])
  expect(events.at(-1)).toEqual({ kind: 'detach' })
  await remounted.dispose()
  disposeRoot()
  await slotsFiber.dispose()
})
