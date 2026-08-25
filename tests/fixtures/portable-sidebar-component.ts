import { defineComponentManifest } from '@dsh-std/manifest'
import { defineFacet } from '@dsh-std/sdk'
import { contributionHostRequirement, type ContributionHostClient } from '@dsh-std/ui'
import {
  SECONDARY_SIDEBAR_PLACEMENT,
  SIDEBAR_VIEW,
  sidebarViewRequirement,
  type SidebarViewInstanceContext,
  type SidebarViewProps,
  type SidebarViewProvider,
} from '@dsh-std/ui-browser'

export interface PortableSidebarEvent {
  readonly kind: 'create' | 'abort' | 'dispose'
  readonly view: string
  readonly context: SidebarViewInstanceContext
}

/** External fixture: no Harness or right-sidebar package imports. */
export function portableSidebarFixture(events: PortableSidebarEvent[]) {
  const outline = (_props: SidebarViewProps): null => null
  const history = (_props: SidebarViewProps): null => null
  const manifest = defineComponentManifest({
    apiVersion: 'manifest.dsh/internal/v1alpha1',
    kind: 'Component',
    metadata: { name: 'fixture.portable.sidebar', version: '1.0.0' },
    spec: { facets: [{
      name: 'web',
      activation: {
        apiVersion: 'browser.ui.dsh/v1alpha1',
        kind: 'LocalModule',
        spec: { module: './client.js' },
      },
      protocols: { requires: [contributionHostRequirement({ surfaces: [sidebarViewRequirement()] })] },
    }] },
  })
  const module = defineFacet(activation => {
    const ui = activation.protocols.client<ContributionHostClient>({
      apiVersion: 'ui.dsh/v1alpha1', kind: 'ContributionHost',
    })
    if (ui === undefined) throw new Error('portable sidebar fixture requires ContributionHost')
    for (const [id, label, order, component] of [
      ['outline', 'Outline', 20, outline],
      ['history', 'History', 30, history],
    ] as const) {
      const provider: SidebarViewProvider = {
        create(context) {
          events.push({ kind: 'create', view: id, context })
          context.signal.addEventListener('abort', () => {
            events.push({ kind: 'abort', view: id, context })
          }, { once: true })
          return {
            component,
            dispose: () => { events.push({ kind: 'dispose', view: id, context }) },
          }
        },
      }
      ui.register({
        descriptor: {
          id,
          surface: SIDEBAR_VIEW,
          placement: SECONDARY_SIDEBAR_PLACEMENT,
          content: { label, order },
        },
        localModule: provider,
      })
    }
  })
  return { manifest, module, outline, history }
}
