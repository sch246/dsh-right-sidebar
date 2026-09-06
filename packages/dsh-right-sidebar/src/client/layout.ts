/** Pure operations over the sole per-session workbench layout tree. */
import type {
  RightSidebarDirection,
  RightSidebarGroup,
  RightSidebarLayoutNode,
  RightSidebarSplit,
} from './contract'

/** Normalized rectangle inside the workbench content area. */
export interface LayoutRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** Render geometry for one split handle. */
export interface SplitGeometry extends LayoutRect {
  readonly id: string
  readonly axis: RightSidebarSplit['axis']
  readonly owner: LayoutRect
}

/** Derived render geometry; it is never a second layout authority. */
export interface LayoutGeometry {
  readonly groups: ReadonlyMap<string, LayoutRect>
  readonly splits: readonly SplitGeometry[]
}

/** Return groups in stable tree preorder. */
export function groupsOf(root: RightSidebarLayoutNode): readonly RightSidebarGroup[] {
  return root.kind === 'group'
    ? [root]
    : [...groupsOf(root.first), ...groupsOf(root.second)]
}

/** Find one group by id. */
export function findGroup(root: RightSidebarLayoutNode, id: string): RightSidebarGroup | undefined {
  if (root.kind === 'group') return root.id === id ? root : undefined
  return findGroup(root.first, id) ?? findGroup(root.second, id)
}

/** Find the unique group containing an instance. */
export function groupContaining(root: RightSidebarLayoutNode, instanceId: string): RightSidebarGroup | undefined {
  return groupsOf(root).find(group => group.instances.some(instance => instance.id === instanceId))
}

/** Replace one group while retaining every unaffected branch identity. */
export function mapGroup(
  root: RightSidebarLayoutNode,
  id: string,
  update: (group: RightSidebarGroup) => RightSidebarGroup,
): RightSidebarLayoutNode {
  if (root.kind === 'group') return root.id === id ? update(root) : root
  const first = mapGroup(root.first, id, update)
  const second = mapGroup(root.second, id, update)
  return first === root.first && second === root.second
    ? root
    : Object.freeze({ ...root, first, second })
}

function replaceGroupNode(
  root: RightSidebarLayoutNode,
  id: string,
  replacement: RightSidebarLayoutNode,
): RightSidebarLayoutNode {
  if (root.kind === 'group') return root.id === id ? replacement : root
  const first = replaceGroupNode(root.first, id, replacement)
  const second = replaceGroupNode(root.second, id, replacement)
  return first === root.first && second === root.second
    ? root
    : Object.freeze({ ...root, first, second })
}

/** Replace one split while retaining every unaffected branch identity. */
export function mapSplit(
  root: RightSidebarLayoutNode,
  id: string,
  update: (split: RightSidebarSplit) => RightSidebarSplit,
): RightSidebarLayoutNode {
  if (root.kind === 'group') return root
  if (root.id === id) return update(root)
  const first = mapSplit(root.first, id, update)
  const second = mapSplit(root.second, id, update)
  return first === root.first && second === root.second
    ? root
    : Object.freeze({ ...root, first, second })
}

/** Split a leaf in half and return the resulting tree. */
export function splitGroup(
  root: RightSidebarLayoutNode,
  groupId: string,
  direction: Exclude<RightSidebarDirection, 'center'>,
  newGroup: RightSidebarGroup,
  splitId: string,
): RightSidebarLayoutNode {
  const axis = direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical'
  const group = findGroup(root, groupId)
  if (group === undefined) return root
  const replacement: RightSidebarSplit = Object.freeze({
    kind: 'split',
    id: splitId,
    axis,
    ratio: 0.5,
    first: direction === 'left' || direction === 'up' ? newGroup : group,
    second: direction === 'left' || direction === 'up' ? group : newGroup,
  })
  return replaceGroupNode(root, groupId, replacement)
}

/** Collapse an empty group and its parent branch. The sole root group remains. */
export function collapseGroup(root: RightSidebarLayoutNode, groupId: string): RightSidebarLayoutNode {
  if (root.kind === 'group') return root
  if (root.first.kind === 'group' && root.first.id === groupId) return root.second
  if (root.second.kind === 'group' && root.second.id === groupId) return root.first
  const first = collapseGroup(root.first, groupId)
  const second = collapseGroup(root.second, groupId)
  return first === root.first && second === root.second
    ? root
    : Object.freeze({ ...root, first, second })
}

/** Derive normalized leaf and divider rectangles from split ratios. */
export function layoutGeometry(root: RightSidebarLayoutNode): LayoutGeometry {
  const groups = new Map<string, LayoutRect>()
  const splits: SplitGeometry[] = []
  const visit = (node: RightSidebarLayoutNode, rect: LayoutRect): void => {
    if (node.kind === 'group') {
      groups.set(node.id, rect)
      return
    }
    const ratio = Math.min(1, Math.max(0, node.ratio))
    if (node.axis === 'horizontal') {
      const firstWidth = rect.width * ratio
      visit(node.first, { ...rect, width: firstWidth })
      visit(node.second, {
        x: rect.x + firstWidth,
        y: rect.y,
        width: rect.width - firstWidth,
        height: rect.height,
      })
      splits.push({
        id: node.id,
        axis: node.axis,
        x: rect.x + firstWidth,
        y: rect.y,
        width: 0,
        height: rect.height,
        owner: rect,
      })
      return
    }
    const firstHeight = rect.height * ratio
    visit(node.first, { ...rect, height: firstHeight })
    visit(node.second, {
      x: rect.x,
      y: rect.y + firstHeight,
      width: rect.width,
      height: rect.height - firstHeight,
    })
    splits.push({
      id: node.id,
      axis: node.axis,
      x: rect.x,
      y: rect.y + firstHeight,
      width: rect.width,
      height: 0,
      owner: rect,
    })
  }
  visit(root, { x: 0, y: 0, width: 1, height: 1 })
  return { groups, splits }
}

/** Resolve an existing directional target using geometry then stable preorder. */
export function resolveDirectionalGroup(
  root: RightSidebarLayoutNode,
  sourceGroupId: string,
  direction: RightSidebarDirection,
): string | undefined {
  if (direction === 'center') return sourceGroupId
  const geometry = layoutGeometry(root).groups
  const source = geometry.get(sourceGroupId)
  if (source === undefined) return undefined
  const sourceCenterX = source.x + source.width / 2
  const sourceCenterY = source.y + source.height / 2
  const ranked = groupsOf(root).flatMap((group, order) => {
    if (group.id === sourceGroupId) return []
    const rect = geometry.get(group.id)
    if (rect === undefined) return []
    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2
    const eligible = direction === 'right' ? centerX > sourceCenterX
      : direction === 'left' ? centerX < sourceCenterX
        : direction === 'down' ? centerY > sourceCenterY
          : centerY < sourceCenterY
    if (!eligible) return []
    const primary = direction === 'right' ? Math.max(0, rect.x - (source.x + source.width))
      : direction === 'left' ? Math.max(0, source.x - (rect.x + rect.width))
        : direction === 'down' ? Math.max(0, rect.y - (source.y + source.height))
          : Math.max(0, source.y - (rect.y + rect.height))
    const secondary = direction === 'right' || direction === 'left'
      ? Math.abs(centerY - sourceCenterY)
      : Math.abs(centerX - sourceCenterX)
    return [{ id: group.id, primary, secondary, order }]
  })
  ranked.sort((left, right) => left.primary - right.primary
    || left.secondary - right.secondary
    || left.order - right.order)
  return ranked[0]?.id
}

/** Classify the four ten-percent edge regions with a stable corner tie break. */
export function dropDirection(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
): RightSidebarDirection {
  if (rect.width <= 0 || rect.height <= 0) return 'center'
  const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
  const candidates: Array<{ direction: Exclude<RightSidebarDirection, 'center'>; distance: number; order: number }> = []
  if (x <= 0.1) candidates.push({ direction: 'left', distance: x, order: 0 })
  if (x >= 0.9) candidates.push({ direction: 'right', distance: 1 - x, order: 1 })
  if (y <= 0.1) candidates.push({ direction: 'up', distance: y, order: 2 })
  if (y >= 0.9) candidates.push({ direction: 'down', distance: 1 - y, order: 3 })
  candidates.sort((left, right) => left.distance - right.distance || left.order - right.order)
  return candidates[0]?.direction ?? 'center'
}

/** Half-area result preview for an edge destination. */
export function dropPreviewStyle(direction: RightSidebarDirection): Readonly<Record<string, string>> {
  switch (direction) {
    case 'left': return { left: '0', top: '0', width: '50%', height: '100%' }
    case 'right': return { left: '50%', top: '0', width: '50%', height: '100%' }
    case 'up': return { left: '0', top: '0', width: '100%', height: '50%' }
    case 'down': return { left: '0', top: '50%', width: '100%', height: '50%' }
    case 'center': return { left: '0', top: '0', width: '100%', height: '100%' }
  }
}
