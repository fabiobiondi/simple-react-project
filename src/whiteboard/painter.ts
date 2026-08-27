import type { Stroke, StrokeStyle } from './drawing'
import { segmentsOf, type Segment } from './geometry'

/**
 * The whiteboard is white, and its white is painted on the canvas rather than
 * showing through from behind it. That is what makes the eraser a white stroke
 * and what keeps an exported PNG from coming out full of holes.
 */
export const BACKGROUND = '#ffffff'

/** What a canvas must be told before anything is painted on it. */
export type Size = { width: number; height: number }

/**
 * Nothing in this file decides anything: it turns segments into canvas calls
 * and stops there. A canvas cannot be tested under jsdom, so anything worth
 * testing has to live where it can be — in the geometry and the drawing.
 * A decision that ends up here has been put in the wrong place.
 */
function paintSegment(
  context: CanvasRenderingContext2D,
  segment: Segment,
  style: StrokeStyle,
) {
  context.strokeStyle = style.color
  context.fillStyle = style.color
  context.lineWidth = style.width
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()

  switch (segment.kind) {
    case 'dot':
      context.arc(segment.at.x, segment.at.y, style.width / 2, 0, Math.PI * 2)
      context.fill()
      return
    case 'line':
      context.moveTo(segment.from.x, segment.from.y)
      context.lineTo(segment.to.x, segment.to.y)
      break
    case 'quad':
      context.moveTo(segment.from.x, segment.from.y)
      context.quadraticCurveTo(
        segment.control.x,
        segment.control.y,
        segment.to.x,
        segment.to.y,
      )
      break
  }

  context.stroke()
}

/** Paints the piece a stroke has just grown, while it is being drawn. */
export function paintNewest(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  segment: Segment,
) {
  paintSegment(context, segment, stroke)
}

/** Paints everything, from scratch, onto a canvas that has been cleared. */
export function paintDrawing(
  context: CanvasRenderingContext2D,
  strokes: readonly Stroke[],
  size: Size,
) {
  context.fillStyle = BACKGROUND
  context.fillRect(0, 0, size.width, size.height)

  for (const stroke of strokes) {
    for (const segment of segmentsOf(stroke.points)) {
      paintSegment(context, segment, stroke)
    }
  }
}
