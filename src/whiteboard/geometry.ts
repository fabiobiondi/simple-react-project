/** A point on the canvas, in CSS pixels relative to its top-left corner. */
export type Point = { x: number; y: number }

/**
 * One piece of a stroke's path, ready to be handed to a canvas.
 *
 * Segments exist so that the shape of a stroke is decided here, where it can
 * be tested, rather than inside the painter, which cannot be. A stroke that
 * never moved is a line from a point to itself: with a round cap that paints
 * a dot, so even "what a dot looks like" stays out of the painter.
 */
export type Segment =
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
  const index = points.length - 2
  if (index < 1) return null

  return {
    kind: 'quad',
    from: index === 1 ? points[0] : midpoint(points[index - 1], points[index]),
    control: points[index],
    to: midpoint(points[index], points[index + 1]),
  }
}

/**
 * The piece that closes a stroke: everything from the last curve's end to the
 * final point, which no further point will turn into a curve. Only a stroke
 * that has ended has one.
 */
export function finalSegment(points: readonly Point[]): Segment {
  const last = points[points.length - 1]

  // A single point: a line to itself, which a round cap paints as a dot.
  if (points.length === 1) return { kind: 'line', from: last, to: last }
  if (points.length === 2) return { kind: 'line', from: points[0], to: last }

  return {
    kind: 'line',
    from: midpoint(points[points.length - 2], points[points.length - 1]),
    to: last,
  }
}

/**
 * Every curve of a stroke, built directly rather than by replaying
 * `newestSegment`. The two derivations are independent on purpose: a test that
 * compares them is then worth something, where one defined as the other would
 * hold however wrong both were.
 */
function curvesOf(points: readonly Point[]): Segment[] {
  const curves: Segment[] = []

  for (let index = 1; index <= points.length - 2; index++) {
    curves.push({
      kind: 'quad',
      from: index === 1 ? points[0] : midpoint(points[index - 1], points[index]),
      control: points[index],
      to: midpoint(points[index], points[index + 1]),
    })
  }

  return curves
}

/**
 * The path of a stroke, for painting one onto a canvas that has been cleared.
 *
 * A stroke still being drawn is *not* closed: its final piece has not been
 * painted live yet, so painting it during a repaint would leave a spur the
 * live drawing never had.
 */
export function segmentsOf(
  points: readonly Point[],
  closed: boolean,
): Segment[] {
  if (points.length === 0) return []

  const curves = curvesOf(points)

  return closed ? [...curves, finalSegment(points)] : curves
}
