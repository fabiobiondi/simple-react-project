import type { Point } from './geometry'

/** What a stroke is drawn with. Colour and width always travel together. */
export type StrokeStyle = { color: string; width: number }

/** One press-drag-release, kept as the points it passed through. */
export type Stroke = StrokeStyle & {
  points: Point[]
  /** False while the stroke is still being drawn: it has no final piece yet. */
  closed: boolean
}

export interface Drawing {
  /** Every stroke, oldest first, including one still being drawn. */
  readonly strokes: readonly Stroke[]
  /** The stroke being drawn, or null when the pointer is not down. */
  readonly current: Stroke | null
  begin(point: Point, style: StrokeStyle): void
  extend(point: Point): void
  end(): void
}

/**
 * The drawing, as a list of strokes rather than as pixels.
 *
 * Assigning a canvas's width clears it — even to the value it already had —
 * and the device pixel ratio changes on page zoom without any resize event.
 * Keeping the strokes is the only way a drawing survives either.
 *
 * Deliberately mutable, and deliberately not React state: a stroke gathers a
 * point per pointer event, and re-rendering that often would be absurd for
 * something React does not draw.
 */
export function createDrawing(): Drawing {
  const strokes: Stroke[] = []
  let inProgress: Stroke | null = null

  return {
    get strokes() {
      return strokes
    },
    get current() {
      return inProgress
    },

    begin(point, style) {
      // Pushed at once, so a redraw mid-stroke does not lose what is being drawn.
      inProgress = { points: [point], closed: false, ...style }
      strokes.push(inProgress)
    },

    extend(point) {
      inProgress?.points.push(point)
    },

    end() {
      if (inProgress) inProgress.closed = true
      inProgress = null
    },
  }
}
