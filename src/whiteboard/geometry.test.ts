import { describe, expect, it } from 'vitest'
import {
  finalSegment,
  newestSegment,
  segmentsOf,
  type Point,
} from './geometry'

const p = (x: number, y: number): Point => ({ x, y })
const trail = (count: number) =>
  Array.from({ length: count }, (_, i) => p(i * 10, i * i))

describe('segmentsOf', () => {
  it('draws nothing for a stroke with no points', () => {
    expect(segmentsOf([], true)).toEqual([])
  })

  it('draws a stroke that never moved as a line to itself', () => {
    // which a round cap paints as a dot, so the painter is not left deciding
    // what a dot is
    expect(segmentsOf([p(3, 4)], true)).toEqual([
      { kind: 'line', from: p(3, 4), to: p(3, 4) },
    ])
  })

  it('draws a straight line between two points', () => {
    expect(segmentsOf([p(0, 0), p(10, 0)], true)).toEqual([
      { kind: 'line', from: p(0, 0), to: p(10, 0) },
    ])
  })

  it('curves through the middle points rather than joining them straight', () => {
    const points = [p(0, 0), p(10, 0), p(20, 10)]

    expect(segmentsOf(points, true)).toEqual([
      // the recorded point becomes the control, the midpoint the end: this is
      // what bends the path instead of cornering at it
      { kind: 'quad', from: p(0, 0), control: p(10, 0), to: p(15, 5) },
      { kind: 'line', from: p(15, 5), to: p(20, 10) },
    ])
  })

  it('leaves no gaps: each segment starts where the previous one ended', () => {
    const segments = segmentsOf(trail(8), true)

    for (let i = 1; i < segments.length; i++) {
      expect(segments[i].from).toEqual(segments[i - 1].to)
    }
  })

  it('leaves a stroke still being drawn open', () => {
    const points = trail(6)

    const open = segmentsOf(points, false)
    const closed = segmentsOf(points, true)

    // the closing piece has not been painted live yet: painting it during a
    // repaint would leave a spur the live drawing never had
    expect(closed).toEqual([...open, finalSegment(points)])
  })
})

describe('drawing live and repainting agree', () => {
  // The guarantee the whole design rests on: what is painted point by point
  // while the mouse moves must be exactly what a repaint paints later.
  // `segmentsOf` is built directly rather than by replaying `newestSegment`,
  // so this compares two independent derivations rather than one with itself.
  it.each([1, 2, 3, 4, 5, 9, 20])('for a stroke of %i points', (count) => {
    const points = trail(count)

    const painted = []
    for (let n = 1; n <= count; n++) {
      const segment = newestSegment(points.slice(0, n))
      if (segment) painted.push(segment)
    }

    expect(painted).toEqual(segmentsOf(points, false))
    expect([...painted, finalSegment(points)]).toEqual(segmentsOf(points, true))
  })
})

describe('newestSegment', () => {
  it('has nothing to draw until a curve can be formed', () => {
    expect(newestSegment([p(0, 0)])).toBeNull()
    expect(newestSegment([p(0, 0), p(10, 0)])).toBeNull()
  })

  it('reports only the piece the newest point completed', () => {
    const points = [p(0, 0), p(10, 0), p(20, 10)]

    expect(newestSegment(points)).toEqual({
      kind: 'quad',
      from: p(0, 0),
      control: p(10, 0),
      to: p(15, 5),
    })
  })

  it('depends only on the tail of the stroke, never on its length', () => {
    const long = [...trail(50), p(0, 0), p(10, 0), p(20, 10)]

    // the same answer as if the stroke had only ever been four points long:
    // the work per event does not grow with the stroke, which is what keeps
    // live drawing linear instead of quadratic
    expect(newestSegment(long)).toEqual(newestSegment(long.slice(-4)))
  })
})
