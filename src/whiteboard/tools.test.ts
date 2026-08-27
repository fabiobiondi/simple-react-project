import { describe, expect, it } from 'vitest'
import { BOARD, COLORS, DEFAULT_TOOL, strokeStyleOf, WIDTHS } from './tools'

describe('strokeStyleOf', () => {
  it('draws in the chosen colour', () => {
    expect(strokeStyleOf({ color: '#d73a4a', width: 4, erasing: false })).toEqual(
      { color: '#d73a4a', width: 4 },
    )
  })

  it('erases in the board’s own white, not merely something pale', () => {
    // The eraser is not a mechanism: it is a stroke the colour of the board,
    // exactly as a cloth is on a real whiteboard. If these two ever drifted
    // apart, erasing would leave a visible ghost.
    expect(strokeStyleOf({ color: '#d73a4a', width: 4, erasing: true })).toEqual(
      { color: BOARD, width: 4 },
    )
  })

  it('erases at the chosen width', () => {
    const wide = strokeStyleOf({ color: '#000000', width: 10, erasing: true })

    expect(wide.width).toBe(10)
  })

  it('remembers the pen’s colour while erasing', () => {
    const erasing = { color: '#0969da', width: 4, erasing: true }

    // the colour is still there to come back to
    expect(strokeStyleOf({ ...erasing, erasing: false }).color).toBe('#0969da')
  })
})

describe('DEFAULT_TOOL', () => {
  it('starts on a colour and a width it actually offers, and not erasing', () => {
    expect(COLORS.map((c) => c.value)).toContain(DEFAULT_TOOL.color)
    expect(WIDTHS.map((w) => w.value)).toContain(DEFAULT_TOOL.width)
    expect(DEFAULT_TOOL.erasing).toBe(false)
  })
})
