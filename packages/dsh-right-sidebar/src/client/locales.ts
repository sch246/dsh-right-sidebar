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
  | 'useVerticalTabs'
  | 'useHorizontalTabs'
  | 'defaultTabOrientation'
  | 'horizontalTabs'
  | 'verticalTabs'
  | 'newGroupsOnly'
  | 'resizeGroups'
  | 'resizeTabRail'
  | 'restoreTabRail'
  | 'restoringInstance'
  | 'restoreFailed'
  | 'missingView'

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
  useVerticalTabs: '改用纵向标签',
  useHorizontalTabs: '改用横向标签',
  defaultTabOrientation: '新分组标签方向',
  horizontalTabs: '横向',
  verticalTabs: '纵向',
  newGroupsOnly: '仅影响之后新建的分组',
  resizeGroups: '调整相邻分组大小',
  resizeTabRail: '调整纵向标签栏宽度',
  restoreTabRail: '恢复标签栏',
  restoringInstance: '正在恢复此内容…',
  restoreFailed: '无法恢复此内容',
  missingView: '提供此内容的插件当前不可用',
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
  useVerticalTabs: 'Use vertical tabs',
  useHorizontalTabs: 'Use horizontal tabs',
  defaultTabOrientation: 'Tab direction for new groups',
  horizontalTabs: 'Horizontal',
  verticalTabs: 'Vertical',
  newGroupsOnly: 'Applies only to groups created afterwards',
  resizeGroups: 'Resize adjacent groups',
  resizeTabRail: 'Resize vertical tab rail',
  restoreTabRail: 'Restore tab rail',
  restoringInstance: 'Restoring this content…',
  restoreFailed: 'This content could not be restored',
  missingView: 'The plugin for this content is unavailable',
}
