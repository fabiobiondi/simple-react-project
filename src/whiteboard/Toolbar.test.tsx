import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Toolbar } from './Toolbar'
import { COLORS, DEFAULT_TOOL, WIDTHS } from './tools'

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
  it('is exposed as a named group of controls', () => {
    renderToolbar()

    expect(screen.getByRole('group', { name: /tools/i })).toBeVisible()
  })

  it('offers every colour as a named button', () => {
    renderToolbar()

    for (const colour of COLORS) {
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
    renderToolbar({ ...DEFAULT_TOOL, color: COLORS[1].value })

    const pressed = COLORS.filter(
      (colour) =>
        screen
          .getByRole('button', { name: colour.name })
          .getAttribute('aria-pressed') === 'true',
    )

    expect(pressed).toEqual([COLORS[1]])
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

    await userEvent.click(screen.getByRole('button', { name: COLORS[1].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
      color: COLORS[1].value,
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
    for (const colour of COLORS) {
      expect(colour.value).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('offers an eraser, idle until it is picked up', () => {
    renderToolbar()

    expect(screen.getByRole('button', { name: 'Eraser' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('shows the eraser as in use while erasing', () => {
    renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    expect(screen.getByRole('button', { name: 'Eraser' })).toHaveAttribute(
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

    for (const colour of COLORS) {
      expect(
        screen.getByRole('button', { name: colour.name }),
      ).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('picking a colour puts the eraser down', async () => {
    const { onToolChange } = renderToolbar({ ...DEFAULT_TOOL, erasing: true })

    await userEvent.click(screen.getByRole('button', { name: COLORS[2].name }))

    expect(onToolChange).toHaveBeenCalledWith({
      ...DEFAULT_TOOL,
      color: COLORS[2].value,
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
