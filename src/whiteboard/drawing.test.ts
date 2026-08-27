import { describe, expect, it } from 'vitest'
import { createDrawing } from './drawing'

const black = { color: '#000000', width: 3 }
const red = { color: '#ff0000', width: 9 }

describe('createDrawing', () => {
  it('starts empty', () => {
    expect(createDrawing().strokes).toEqual([])
  })

  it('records the point a stroke began at', () => {
    const drawing = createDrawing()

    drawing.begin({ x: 1, y: 2 }, black)

    expect(drawing.strokes).toEqual([
      { points: [{ x: 1, y: 2 }], color: '#000000', width: 3 },
    ])
  })

  it('accumulates points in the order they arrived', () => {
    const drawing = createDrawing()

    drawing.begin({ x: 0, y: 0 }, black)
    drawing.extend({ x: 1, y: 1 })
    drawing.extend({ x: 2, y: 2 })
    drawing.end()

    expect(drawing.strokes[0].points).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })

  it('ignores movement when no stroke is being drawn', () => {
    const drawing = createDrawing()

    drawing.extend({ x: 1, y: 1 })

    expect(drawing.strokes).toEqual([])
  })

  it('ignores movement once the stroke has ended', () => {
    const drawing = createDrawing()

    drawing.begin({ x: 0, y: 0 }, black)
    drawing.end()
    drawing.extend({ x: 50, y: 50 })

    expect(drawing.strokes[0].points).toEqual([{ x: 0, y: 0 }])
  })

  it('survives ending a stroke that was never begun', () => {
    const drawing = createDrawing()

    expect(() => drawing.end()).not.toThrow()
    expect(drawing.strokes).toEqual([])
  })

  it('keeps the stroke in progress visible, so a redraw does not lose it', () => {
    const drawing = createDrawing()

    drawing.begin({ x: 0, y: 0 }, black)
    drawing.extend({ x: 1, y: 1 })

    expect(drawing.strokes).toHaveLength(1)
    expect(drawing.isDrawing).toBe(true)
  })

  it('knows when nothing is being drawn', () => {
    const drawing = createDrawing()
    expect(drawing.isDrawing).toBe(false)

    drawing.begin({ x: 0, y: 0 }, black)
    drawing.end()

    expect(drawing.isDrawing).toBe(false)
  })

  it('gives every stroke the style it was begun with', () => {
    const drawing = createDrawing()

    drawing.begin({ x: 0, y: 0 }, black)
    drawing.end()
    drawing.begin({ x: 5, y: 5 }, red)
    drawing.end()

    expect(drawing.strokes.map((s) => s.color)).toEqual(['#000000', '#ff0000'])
    expect(drawing.strokes.map((s) => s.width)).toEqual([3, 9])
  })

  it('keeps strokes in the order they were drawn', () => {
    const drawing = createDrawing()

    for (const x of [0, 1, 2]) {
      drawing.begin({ x, y: 0 }, black)
      drawing.end()
    }

    expect(drawing.strokes.map((s) => s.points[0].x)).toEqual([0, 1, 2])
  })
})
