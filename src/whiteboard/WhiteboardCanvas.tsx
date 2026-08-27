import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type PointerEvent,
  type Ref,
} from 'react'
import { createDrawing, type StrokeStyle } from './drawing'
import { finalSegment, newestSegment, type Point } from './geometry'
import { paintDrawing, paintSegment } from './painter'
import './WhiteboardCanvas.css'

const pointOf = (event: PointerEvent<HTMLCanvasElement>): Point => ({
  x: event.nativeEvent.offsetX,
  y: event.nativeEvent.offsetY,
})

/**
 * What the board can be asked to do that is not drawing: both act on the
 * canvas itself, which is not something a prop can express.
 */
export interface WhiteboardHandle {
  clear(): void
  exportPng(): void
}

export interface WhiteboardCanvasProps {
  /** What the next stroke will be drawn with. Strokes already drawn keep theirs. */
  tool: StrokeStyle
  ref?: Ref<WhiteboardHandle>
}

/** The name a board is saved under. */
const FILENAME = 'whiteboard.png'

export function WhiteboardCanvas({ tool, ref }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Not state: a stroke gathers a point per pointer event, and React does not
  // draw any of them.
  const drawingRef = useRef(createDrawing())

  // jsdom has no 2D context, so every use of it is optional rather than a
  // guarantee. The component still renders and still records strokes there.
  const context = () => canvasRef.current?.getContext('2d') ?? null
  // Set once the canvas is fitted; repainting from outside the effect needs it.
  const repaintRef = useRef(() => {})

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

    repaintRef.current = fit
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

  useImperativeHandle(ref, () => ({
    clear() {
      drawingRef.current.clear()
      // The bitmap keeps whatever was painted on it until something repaints:
      // emptying the strokes is not enough to empty the board.
      repaintRef.current()
    },

    exportPng() {
      // The board's white is painted on the canvas, so what comes out is what
      // is seen — no transparent holes where nothing was drawn or where the
      // eraser went.
      canvasRef.current?.toBlob((blob) => {
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = FILENAME
        link.click()
        URL.revokeObjectURL(url)
      }, 'image/png')
    },
  }))

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0) return
    // Capture, so a stroke that ends outside the canvas still ends here and
    // does not resume when the pointer wanders back in.
    event.currentTarget.setPointerCapture(event.pointerId)
    // Copied into the stroke as it begins, so changing tool later leaves
    // what is already drawn alone.
    drawingRef.current.begin(pointOf(event), tool)
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current
    const stroke = drawing.current
    if (!stroke) return

    drawing.extend(pointOf(event))

    const segment = newestSegment(stroke.points)
    const target = context()
    // Only the piece the newest point completed: painting the whole stroke on
    // every event would slow down as the stroke grew.
    if (segment && target) paintSegment(target, segment, stroke)
  }

  const handlePointerUp = () => {
    const drawing = drawingRef.current
    const stroke = drawing.current
    if (!stroke) return

    const target = context()
    // The piece that closes the stroke, which no further point will curve.
    if (target) paintSegment(target, finalSegment(stroke.points), stroke)
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
