/** Locale namespace and dictionaries of the right-sidebar platform. */

export const NS = 'right-sidebar'

/** Dictionary key union of this namespace (typed `t` seat at registration). */
export type RightSidebarKey =
  | 'title'
  | 'expand'
  | 'collapse'
  | 'empty'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'right-sidebar': RightSidebarKey
  }
}

export const zh: Record<RightSidebarKey, string> = {
  title: '侧边栏',
  expand: '展开',
  collapse: '收起',
  empty: '尚未注册侧栏标签页',
}

export const en: Record<RightSidebarKey, string> = {
  title: 'Sidebar',
  expand: 'Expand',
  collapse: 'Collapse',
  empty: 'No sidebar tabs registered',
}
