import { useLayoutEffect, useRef, type PointerEvent } from 'react'
import { createDrawing } from './drawing'
import { finalSegment, newestSegment, type Point } from './geometry'
import { paintDrawing, paintNewest } from './painter'
import './WhiteboardCanvas.css'

/** The one pen there is, until the toolbar arrives. */
const PEN = { color: '#000000', width: 3 }

const pointOf = (event: PointerEvent<HTMLCanvasElement>): Point => ({
  x: event.nativeEvent.offsetX,
  y: event.nativeEvent.offsetY,
})

export function WhiteboardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Not state: a stroke gathers a point per pointer event, and React does not
  // draw any of them.
  const drawingRef = useRef(createDrawing())

  // jsdom has no 2D context, so every use of it is optional rather than a
  // guarantee. The component still renders and still records strokes there.
  const context = () => canvasRef.current?.getContext('2d') ?? null

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    /**
     * Re-fits the canvas to its box and repaints the drawing onto it.
     *
     * Assigning `width` or `height` wipes the bitmap, the transform and every
     * style — even when the value assigned is the one already there — so this
     * is never a cheap no-op, and the drawing has to be painted back every
     * time. The strokes keep their coordinates: a bigger box shows more of the
     * whiteboard rather than a magnified copy of it.
     */
    const fit = () => {
      const target = canvas.getContext('2d')
      if (!target) return

      const ratio = window.devicePixelRatio || 1
      const { clientWidth: width, clientHeight: height } = canvas

      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      // One transform, so everything else can speak in CSS pixels.
      target.setTransform(ratio, 0, 0, ratio, 0, 0)

      paintDrawing(target, drawingRef.current.strokes, { width, height })
    }

    fit()

    const observer = new ResizeObserver(fit)
    observer.observe(canvas)

    /**
     * `devicePixelRatio` changes when the page is zoomed and when the window
     * moves to a display of a different density, and it emits no event of its
     * own — a resize listener does not see either. The only standard signal is
     * a media query carrying the current value, which therefore has to be
     * rebuilt every time it fires.
     */
    let stopWatchingRatio: (() => void) | undefined
    const watchRatio = () => {
      stopWatchingRatio?.()
      const query = window.matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`,
      )
      const onRatioChange = () => {
        fit()
        watchRatio()
      }
      query.addEventListener('change', onRatioChange)
      stopWatchingRatio = () =>
        query.removeEventListener('change', onRatioChange)
    }
    watchRatio()

    return () => {
      observer.disconnect()
      stopWatchingRatio?.()
    }
  }, [])

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return
    // Capture, so a stroke that ends outside the canvas still ends here and
    // does not resume when the pointer wanders back in.
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current.begin(pointOf(event), PEN)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current
    if (!drawing.isDrawing) return

    drawing.extend(pointOf(event))

    const stroke = drawing.strokes[drawing.strokes.length - 1]
    const segment = newestSegment(stroke.points)
    const target = context()
    // Only the piece the newest point completed: painting the whole stroke on
    // every event would slow down as the stroke grew.
    if (segment && target) paintNewest(target, stroke, segment)
  }

  const handlePointerUp = () => {
    const drawing = drawingRef.current
    if (!drawing.isDrawing) return

    const stroke = drawing.strokes[drawing.strokes.length - 1]
    const target = context()
    if (target) paintNewest(target, stroke, finalSegment(stroke.points))
    drawing.end()
  }

  return (
    <canvas
      ref={canvasRef}
      className="whiteboard-canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  )
}
