import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from './Toolbar'
import { COLOURS, DEFAULT_TOOL, WIDTHS } from './tools'

const renderToolbar = (tool = DEFAULT_TOOL) => {
  const onToolChange = vi.fn()
  render(<Toolbar tool={tool} onToolChange={onToolChange} />)
  return { onToolChange }
}

describe('Toolbar', () => {
  it('is exposed as a named toolbar', () => {
    renderToolbar()

    expect(screen.getByRole('toolbar', { name: /tools/i })).toBeVisible()
  })

  it('offers every colour as a named button', () => {
    renderToolbar()

    for (const colour of COLOURS) {
      expect(screen.getByRole('button', { name: colour.name })).toBeVisible()
    }
  })

  it('offers every width as a named button', () => {
    renderToolbar()

    for (const width of WIDTHS) {
      expect(screen.getByRole('button', { name: width.name })).toBeVisible()
    }
  })

  it('shows which colour is in use, and only one', () => {
    renderToolbar({ ...DEFAULT_TOOL, color: COLOURS[1].value })

    const pressed = COLOURS.filter(
      (colour) =>
        screen
          .getByRole('button', { name: colour.name })
          .getAttribute('aria-pressed') === 'true',
    )

    expect(pressed).toEqual([COLOURS[1]])
  })

  it('shows which width is in use, and only one', () => {
    renderToolbar({ ...DEFAULT_TOOL, width: WIDTHS[2].value })

    const pressed = WIDTHS.filter(
      (width) =>
        screen
          .getByRole('button', { name: width.name })
          .getAttribute('aria-pressed') === 'true',
    )

    expect(pressed).toEqual([WIDTHS[2]])
  })

  it('asks for a new colour without disturbing the width', async () => {
    const { onToolChange } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: COLOURS[1].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      color: COLOURS[1].value,
      width: DEFAULT_TOOL.width,
    })
  })

  it('asks for a new width without disturbing the colour', async () => {
    const { onToolChange } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: WIDTHS[2].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      color: DEFAULT_TOOL.color,
      width: WIDTHS[2].value,
    })
  })

  it('offers no see-through colour', () => {
    // A semi-transparent stroke would leave a necklace of darker dots where
    // the incremental strokes overlap, and would make live drawing and a
    // repaint disagree. Opacity is a correctness constraint here, not a style.
    for (const colour of COLOURS) {
      expect(colour.value).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('starts on a colour and a width it actually offers', () => {
    expect(COLOURS.map((c) => c.value)).toContain(DEFAULT_TOOL.color)
    expect(WIDTHS.map((w) => w.value)).toContain(DEFAULT_TOOL.width)
  })
})
