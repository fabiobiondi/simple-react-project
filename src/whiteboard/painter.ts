import type { Stroke, StrokeStyle } from './drawing'
import { segmentsOf, type Segment } from './geometry'
import { BOARD } from './board'

/** What a canvas must be told before anything is painted on it. */
export type Size = { width: number; height: number }

/**
 * Nothing in this file decides anything: it turns segments into canvas calls
 * and stops there. A canvas cannot be tested under jsdom, so anything worth
 * testing has to live where it can be — in the geometry and the drawing.
 * A decision that ends up here has been put in the wrong place.
 *
 * The one thing set here rather than passed in is the round cap and join,
 * because it is load-bearing rather than decorative: the geometry represents
 * a stroke that never moved as a line from a point to itself, and only a
 * round cap paints that as a dot.
 */
export function paintSegment(
  context: CanvasRenderingContext2D,
  segment: Segment,
  style: StrokeStyle,
) {
  context.strokeStyle = style.color
  context.lineWidth = style.width
  context.lineCap = 'round'
  context.lineJoin = 'round'

  context.beginPath()
  context.moveTo(segment.from.x, segment.from.y)

  if (segment.kind === 'quad') {
    context.quadraticCurveTo(
      segment.control.x,
      segment.control.y,
      segment.to.x,
      segment.to.y,
    )
  } else {
    context.lineTo(segment.to.x, segment.to.y)
  }

  context.stroke()
}

/** Paints everything, from scratch, onto a canvas that has been cleared. */
export function paintDrawing(
  context: CanvasRenderingContext2D,
  strokes: readonly Stroke[],
  size: Size,
) {
  // The board's white is painted on, not shown through from behind: a repaint
  // starts from a cleared bitmap, and without this the cleared parts would
  // stay transparent.
  context.fillStyle = BOARD
  context.fillRect(0, 0, size.width, size.height)

  for (const stroke of strokes) {
    for (const segment of segmentsOf(stroke.points, stroke.closed)) {
      paintSegment(context, segment, stroke)
    }
  }
}
