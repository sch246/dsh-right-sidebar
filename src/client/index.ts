/** Browser entry for the right-sidebar launcher and multi-instance workbench. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { RightSidebarPanel } from './RightSidebarPanel'
import { RightSidebarToggle } from './RightSidebarToggle'
import { RightSidebarRuntime } from './service'
import { en, NS, zh } from './locales'
import { PANEL_CSS } from './panel.css'
import type {
  RightSidebarInstanceInput,
  RightSidebarInstanceUpdate,
  RightSidebarInstanceViewUpdate,
  RightSidebarLauncher,
  RightSidebarOpenOptions,
  RightSidebarRestorer,
  RightSidebarService,
  RightSidebarSessionId,
  RightSidebarTarget,
  ToggleInjected,
} from './contract'

export {
  RightSidebarError,
  type RightSidebarErrorCode,
  type RightSidebarInstance,
  type RightSidebarInstanceInput,
  type RightSidebarInstanceUpdate,
  type RightSidebarInstanceViewUpdate,
  type RightSidebarDirection,
  type RightSidebarGroup,
  type RightSidebarInstanceAvailability,
  type RightSidebarLayoutNode,
  type RightSidebarLauncher,
  type RightSidebarOpenOptions,
  type RightSidebarRestoreContext,
  type RightSidebarRestoreResult,
  type RightSidebarRestorer,
  type RightSidebarService,
  type RightSidebarSessionId,
  type RightSidebarSplit,
  type RightSidebarTabOrientation,
  type RightSidebarTarget,
  type RightbarViewOwnerProps,
} from './contract'

/** Required services: renderer-owned slots, locale, and official layout actions. */
export const inject = ['slots', 'locale', 'layout']

/**
 * Install the workbench, public service, navbar control and owned resources.
 * @param ctx - Client Cordis context.
 */
export function apply(ctx: ClientContext): void {
  const runtime = new RightSidebarRuntime(ctx)
  const service: RightSidebarService = Object.freeze({
    registerLauncher: (launcher: RightSidebarLauncher): (() => void) =>
      runtime.registerLauncher(launcher),
    registerRestorer: (viewId: string, restore: RightSidebarRestorer): (() => void) =>
      runtime.registerRestorer(viewId, restore),
    launch: async (
      sessionId: RightSidebarSessionId,
      launcherId: string,
      selection?: unknown,
    ): Promise<void> => runtime.launch(sessionId, launcherId, selection),
    openInstance: (
      sessionId: RightSidebarSessionId,
      instance: RightSidebarInstanceInput,
      options?: RightSidebarOpenOptions,
    ): Promise<string> => runtime.openInstance(sessionId, instance, options),
    getInstanceGroup: (sessionId: RightSidebarSessionId, id: string): string =>
      runtime.getInstanceGroup(sessionId, id),
    resolveTarget: (sessionId: RightSidebarSessionId, target: RightSidebarTarget): string | undefined =>
      runtime.resolveTarget(sessionId, target),
    activateInstance: (sessionId: RightSidebarSessionId, id: string): void => {
      runtime.activateInstance(sessionId, id)
    },
    pinInstance: (sessionId: RightSidebarSessionId, id: string): void => {
      runtime.pinInstance(sessionId, id)
    },
    updateInstance: (
      sessionId: RightSidebarSessionId,
      id: string,
      update: RightSidebarInstanceUpdate,
    ): void => {
      runtime.updateInstance(sessionId, id, update)
    },
    switchInstanceView: (
      sessionId: RightSidebarSessionId,
      id: string,
      update: RightSidebarInstanceViewUpdate,
    ): void => {
      runtime.switchInstanceView(sessionId, id, update)
    },
    closeInstance: (sessionId: RightSidebarSessionId, id: string): Promise<void> =>
      runtime.closeInstance(sessionId, id),
  })

  ctx.provide('rightSidebar', service)
  ctx.effect(() => () => { runtime.dispose() }, 'right-sidebar: dispose workbench runtime')

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

  ctx.slots.inject('details', () => ctx.slots.register({
    name: 'details',
    priority: -1,
    locale: NS,
    children: {
      'rightbar.view': { kind: 'list', scope: 'session' },
    },
    inject: (sessionId): ReturnType<RightSidebarRuntime['createPanelFace']> =>
      runtime.createPanelFace(sessionId),
  }, RightSidebarPanel))

  ctx.slots.inject('shell.navbar.action', () => ctx.slots.register({
    name: 'shell.navbar.action',
    id: 'right-sidebar-toggle',
    order: 100,
    locale: NS,
    inject: (): ToggleInjected => ({
      toggleDetails: (detailsOpen) => {
        if (detailsOpen) ctx.layout.closeDetails()
        else ctx.layout.openDetails()
      },
      toggleDetailsMaximized: () => { ctx.layout.toggleDetailsMaximized() },
    }),
  }, RightSidebarToggle))
}
