/** A point on the canvas, in CSS pixels relative to its top-left corner. */
export type Point = { x: number; y: number }

/**
 * One piece of a stroke's path, ready to be handed to a canvas.
 *
 * Segments exist so that the shape of a stroke is decided here, where it can
 * be tested, rather than inside the painter, which cannot be.
 */
export type Segment =
  | { kind: 'dot'; at: Point }
  | { kind: 'line'; from: Point; to: Point }
  | { kind: 'quad'; from: Point; control: Point; to: Point }

const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

/**
 * The curve completed by the arrival of the last point, or null when there is
 * not yet enough of a stroke to bend.
 *
 * Each recorded point becomes a control point and each midpoint an endpoint:
 * that is what bends the path through the samples instead of cornering at
 * them. Joining raw points with straight lines is what makes a fast stroke
 * look like a polyline.
 *
 * Reads a fixed window at the end of the stroke, so the cost per pointer event
 * does not grow as the stroke gets longer.
 */
export function newestSegment(points: readonly Point[]): Segment | null {
  const at = points.length - 2
  if (at < 1) return null

  return {
    kind: 'quad',
    from: at === 1 ? points[0] : midpoint(points[at - 1], points[at]),
    control: points[at],
    to: midpoint(points[at], points[at + 1]),
  }
}

/**
 * The piece that closes a stroke: everything from the last curve's end to the
 * final point, which no further point will turn into a curve.
 */
export function finalSegment(points: readonly Point[]): Segment {
  const last = points[points.length - 1]

  if (points.length === 1) return { kind: 'dot', at: last }
  if (points.length === 2) return { kind: 'line', from: points[0], to: last }

  return {
    kind: 'line',
    from: midpoint(points[points.length - 2], points[points.length - 1]),
    to: last,
  }
}

/**
 * The whole path of a stroke, for repainting one that is already finished.
 *
 * Deliberately the concatenation of what live drawing paints piece by piece:
 * a redraw must land the same pixels as the drawing it replaces.
 */
export function segmentsOf(points: readonly Point[]): Segment[] {
  if (points.length === 0) return []

  const segments: Segment[] = []
  for (let n = 3; n <= points.length; n++) {
    const segment = newestSegment(points.slice(0, n))
    if (segment) segments.push(segment)
  }
  segments.push(finalSegment(points))

  return segments
}
