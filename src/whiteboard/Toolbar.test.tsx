import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from './Toolbar'
import { COLOURS, DEFAULT_TOOL, WIDTHS } from './tools'

const renderToolbar = (tool = DEFAULT_TOOL) => {
  const onToolChange = vi.fn()
  const onClear = vi.fn()
  const onExport = vi.fn()
  render(
    <Toolbar
      tool={tool}
      onToolChange={onToolChange}
      onClear={onClear}
      onExport={onExport}
    />,
  )
  return { onToolChange, onClear, onExport }
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
      ...DEFAULT_TOOL,
      color: COLOURS[1].value,
    })
  })

  it('asks for a new width without disturbing the colour', async () => {
    const { onToolChange } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: WIDTHS[2].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
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

  it('offers the eraser, and shows when it is in use', () => {
    renderToolbar()
    const eraser = screen.getByRole('button', { name: 'Eraser' })
    expect(eraser).toHaveAttribute('aria-pressed', 'false')

    renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    expect(screen.getAllByRole('button', { name: 'Eraser' })[1]).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('puts the eraser down when it is pressed again', async () => {
    const { onToolChange } = renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    await userEvent.click(screen.getByRole('button', { name: 'Eraser' }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
      erasing: false,
    })
  })

  it('claims no colour while erasing, which would be a lie', () => {
    renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    for (const colour of COLOURS) {
      expect(
        screen.getByRole('button', { name: colour.name }),
      ).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('picking a colour puts the eraser down', async () => {
    const { onToolChange } = renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    await userEvent.click(screen.getByRole('button', { name: COLOURS[2].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
      color: COLOURS[2].value,
      erasing: false,
    })
  })

  it('lets the eraser keep its own width', async () => {
    const { onToolChange } = renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    await userEvent.click(screen.getByRole('button', { name: WIDTHS[2].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
      width: WIDTHS[2].value,
      erasing: true,
    })
  })

  it('asks to clear the board without disturbing the tool', async () => {
    const { onClear, onToolChange } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(onClear).toHaveBeenCalledOnce()
    expect(onToolChange).not.toHaveBeenCalled()
  })

  it('asks to export the board', async () => {
    const { onExport } = renderToolbar()

    await userEvent.click(screen.getByRole('button', { name: /export/i }))

    expect(onExport).toHaveBeenCalledOnce()
  })
})
