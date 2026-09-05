// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import type { RightSidebarGroup, RightSidebarLayoutNode } from '../src/client/contract'
import { dropDirection, dropPreviewStyle, layoutGeometry, resolveDirectionalGroup } from '../src/client/layout'

function group(id: string): RightSidebarGroup {
  return {
    kind: 'group', id, tabOrientation: 'horizontal', verticalRailWidth: 180,
    instances: [], activeInstanceId: undefined,
  }
}

const layout: RightSidebarLayoutNode = {
  kind: 'split', id: 'root', axis: 'horizontal', ratio: 0.4,
  first: group('source'),
  second: {
    kind: 'split', id: 'right-stack', axis: 'vertical', ratio: 0.5,
    first: group('right-top'), second: group('right-bottom'),
  },
}

describe('group layout geometry', () => {
  it('derives nested rectangles and uses preorder as an exact directional tie break', () => {
    const geometry = layoutGeometry(layout)
    expect(geometry.groups.get('source')).toEqual({ x: 0, y: 0, width: 0.4, height: 1 })
    expect(geometry.groups.get('right-top')).toEqual({ x: 0.4, y: 0, width: 0.6, height: 0.5 })
    expect(resolveDirectionalGroup(layout, 'source', 'right')).toBe('right-top')
    expect(resolveDirectionalGroup(layout, 'right-bottom', 'left')).toBe('source')
    expect(resolveDirectionalGroup(layout, 'source', 'left')).toBeUndefined()
  })

  it('uses ten-percent group edges and previews the resulting half area', () => {
    const rect = { left: 100, top: 50, width: 200, height: 100 }
    expect(dropDirection(119, 100, rect)).toBe('left')
    expect(dropDirection(281, 100, rect)).toBe('right')
    expect(dropDirection(200, 59, rect)).toBe('up')
    expect(dropDirection(200, 141, rect)).toBe('down')
    expect(dropDirection(200, 100, rect)).toBe('center')
    expect(dropDirection(119, 59, rect)).toBe('up')
    expect(dropPreviewStyle('down')).toEqual({ left: '0', top: '50%', width: '100%', height: '50%' })
  })
})
