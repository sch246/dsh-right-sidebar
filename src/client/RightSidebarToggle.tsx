/**
 * Global navbar expand/collapse toggle for the right sidebar. The layout
 * owner supplies both the resolved visibility and the authoritative actions,
 * so the control never mirrors geometry in plugin state.
 */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'

/** Full composed props: runtime share + store + injected face + locale. */
export type RightSidebarToggleProps =
  & PropsRuntime<'shell.navbar.action'>
  & PropsLocale<'right-sidebar'>

export function RightSidebarToggle({ detailsOpen, openDetails, closeDetails, t }: RightSidebarToggleProps) {
  const label = detailsOpen ? t('collapse') : t('expand')
  return (
    <button
      type="button"
      className="dsh-rightbar-toggle"
      aria-label={label}
      title={label}
      aria-pressed={detailsOpen}
      onClick={detailsOpen ? closeDetails : openDetails}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
        <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M9.5 2.75v10.5" stroke="currentColor" strokeWidth="1.25" />
        {detailsOpen && <path d="M7.1 5.5 4.6 8l2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  )
}
