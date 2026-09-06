/**
 * Global navbar expand/collapse toggle for the right sidebar. The layout
 * owner supplies resolved visibility while the injected callback writes
 * through the authoritative layout service. Plugin state never mirrors geometry.
 */
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToggleInjected } from './contract'

/** Full composed props: runtime share + store + injected face + locale. */
export type RightSidebarToggleProps =
  & PropsRuntime<'shell.navbar.action'>
  & InjectFace<ToggleInjected>
  & PropsLocale<'right-sidebar'>

/**
 * Render visibility and maximize controls from Host-resolved layout state.
 * @param props - Navbar runtime shares and layout callbacks.
 * @returns One closed-state button or the two open-state controls.
 */
export function RightSidebarToggle({
  detailsOpen,
  detailsMaximized,
  toggleDetails,
  toggleDetailsMaximized,
  t,
}: RightSidebarToggleProps) {
  const sidebarLabel = detailsOpen ? t('closeSidebar') : t('openSidebar')
  const maximizeLabel = detailsMaximized ? t('restoreSidebar') : t('maximizeSidebar')
  return (
    <>
      {detailsOpen && (
        <button
          type="button"
          className="dsh-rightbar-toggle"
          aria-label={maximizeLabel}
          title={maximizeLabel}
          aria-pressed={detailsMaximized}
          data-active={detailsMaximized}
          onClick={toggleDetailsMaximized}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
            {detailsMaximized
              ? <path d="M2.75 6.25h3.5v-3.5M13.25 9.75h-3.5v3.5M6.25 2.75 2.75 6.25m7 7 3.5-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M6.25 2.75h-3.5v3.5M9.75 13.25h3.5v-3.5M2.75 2.75l3.5 3.5m7 7-3.5-3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </button>
      )}
      <button
        type="button"
        className="dsh-rightbar-toggle"
        aria-label={sidebarLabel}
        title={sidebarLabel}
        aria-pressed={detailsOpen}
        data-active={detailsOpen}
        onClick={() => { toggleDetails(detailsOpen) }}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
          <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.25" />
          <path d="M9.5 2.75v10.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
    </>
  )
}
