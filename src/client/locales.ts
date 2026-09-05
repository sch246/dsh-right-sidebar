/** Locale namespace and dictionaries of the right-sidebar platform. */

export const NS = 'right-sidebar'

/** Dictionary key union of this namespace (typed `t` seat at registration). */
export type RightSidebarKey =
  | 'title'
  | 'openSidebar'
  | 'closeSidebar'
  | 'maximizeSidebar'
  | 'restoreSidebar'
  | 'loading'
  | 'failed'
  | 'retry'
  | 'openLauncher'
  | 'launcherTitle'
  | 'closeInstance'
  | 'operationFailed'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'right-sidebar': RightSidebarKey
  }
}

export const zh: Record<RightSidebarKey, string> = {
  title: '侧边栏',
  openSidebar: '打开侧边栏',
  closeSidebar: '关闭侧边栏',
  maximizeSidebar: '最大化侧边栏',
  restoreSidebar: '还原侧边栏',
  loading: '正在加载侧栏内容…',
  failed: '该侧栏内容无法显示',
  retry: '重试',
  openLauncher: '打开启动器',
  launcherTitle: '打开到侧边栏',
  closeInstance: '关闭 {title}',
  operationFailed: '无法完成侧边栏操作',
}

export const en: Record<RightSidebarKey, string> = {
  title: 'Sidebar',
  openSidebar: 'Open sidebar',
  closeSidebar: 'Close sidebar',
  maximizeSidebar: 'Maximize sidebar',
  restoreSidebar: 'Restore sidebar',
  loading: 'Loading sidebar content…',
  failed: 'This sidebar content could not be displayed',
  retry: 'Retry',
  openLauncher: 'Open launcher',
  launcherTitle: 'Open in sidebar',
  closeInstance: 'Close {title}',
  operationFailed: 'The sidebar operation could not be completed',
}
