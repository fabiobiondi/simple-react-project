import { BOARD } from './board'
import type { StrokeStyle } from './drawing'

/**
 * The colours on offer. All opaque, and that is a correctness constraint
 * rather than a matter of taste: a see-through stroke would leave a necklace
 * of darker dots where the incremental strokes overlap, and would make live
 * drawing and a repaint disagree.
 */
export const COLORS = [
  { name: 'Black', value: '#08060d' },
  { name: 'Red', value: '#d73a4a' },
  { name: 'Blue', value: '#0969da' },
  { name: 'Green', value: '#1a7f37' },
] as const

export const WIDTHS = [
  { name: 'Thin', value: 2 },
  { name: 'Medium', value: 4 },
  { name: 'Thick', value: 10 },
] as const

/**
 * What the board is being drawn with. `color` is the pen's colour and stays
 * put while erasing, so putting the eraser down brings the pen back as it was.
 */
export type Tool = StrokeStyle & { erasing: boolean }

/** What the board starts on. */
export const DEFAULT_TOOL: Tool = {
  color: COLORS[0].value,
  width: WIDTHS[1].value,
  erasing: false,
}

/**
 * What a stroke begun with this tool is drawn with.
 *
 * The eraser is not a mechanism: it is a stroke the colour of the board,
 * exactly as a cloth is on a real whiteboard. Nothing downstream — not the
 * drawing, not the painter — can tell one from any other stroke.
 */
export function strokeStyleOf(tool: Tool): StrokeStyle {
  return {
    color: tool.erasing ? BOARD : tool.color,
    width: tool.width,
  }
}
