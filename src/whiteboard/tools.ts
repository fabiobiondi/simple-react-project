import type { StrokeStyle } from './drawing'

/**
 * The colours on offer. All opaque, and that is a correctness constraint
 * rather than a matter of taste: a see-through stroke would leave a necklace
 * of darker dots where the incremental strokes overlap, and would make live
 * drawing and a repaint disagree.
 */
export const COLOURS = [
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

/** What the board starts on. */
export const DEFAULT_TOOL: StrokeStyle = {
  color: COLOURS[0].value,
  width: WIDTHS[1].value,
}
