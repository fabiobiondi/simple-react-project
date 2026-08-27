import type { CSSProperties } from 'react'
import { Button } from '../components/Button'
import { BOARD } from './board'
import { COLORS, WIDTHS, type Tool } from './tools'
import './Toolbar.css'

export interface ToolbarProps {
  /** What the next stroke will be drawn with. */
  tool: Tool
  /** Called with the tool the toolbar would like to be in use. */
  onToolChange: (tool: Tool) => void
  /** Called to empty the board. */
  onClear: () => void
  /** Called to take the board away as a PNG. */
  onExport: () => void
}

/**
 * The whiteboard's tools. Holds no state of its own: it is told what is in
 * use and asks for a change, so there is one source of truth.
 *
 * Choices are Buttons, and their pressed state is what says which is in use —
 * that is the part a screen reader can hear, where the coloured swatch is not.
 */
export function Toolbar({
  tool,
  onToolChange,
  onClear,
  onExport,
}: ToolbarProps) {
  // A group rather than an ARIA toolbar: that role promises arrow-key
  // navigation with a roving tabindex, and these are plain tab stops.
  return (
    <div
      className="toolbar"
      role="group"
      aria-label="Drawing tools"
      // Handed to CSS once, so the board's white has a single source even in
      // the stylesheet.
      style={{ '--board': BOARD } as CSSProperties}
    >
      <div className="toolbar-group">
        {COLORS.map((color) => (
          <Button
            key={color.value}
            variant="ghost"
            size="sm"
            className="toolbar-color"
            aria-label={color.name}
            // Not pressed while erasing: the pen's colour is remembered, but
            // claiming it is in use would be a lie.
            aria-pressed={!tool.erasing && tool.color === color.value}
            onClick={() =>
              onToolChange({ ...tool, color: color.value, erasing: false })
            }
          >
            <span
              className="toolbar-swatch"
              style={{ background: color.value }}
            />
          </Button>
        ))}
      </div>

      <div className="toolbar-group">
        {WIDTHS.map((width) => (
          <Button
            key={width.value}
            variant="ghost"
            size="sm"
            className="toolbar-width"
            aria-label={width.name}
            aria-pressed={tool.width === width.value}
            onClick={() => onToolChange({ ...tool, width: width.value })}
          >
            {/*
              Ink on paper: the nib is the colour in use, so it needs the
              board's white behind it rather than the page's background.

              While erasing no colour is in use, so the nib falls back to the
              grey the stylesheet gives it — fixed rather than themed, because
              the paper behind it is always the board's white. A themed grey
              washed out to 1.27:1 against it in the light theme: invisible,
              which is the one thing this preview must not be.
            */}
            <span className="toolbar-paper">
              <span
                className="toolbar-nib"
                style={{
                  inlineSize: `${width.value}px`,
                  blockSize: `${width.value}px`,
                  background: tool.erasing ? undefined : tool.color,
                }}
              />
            </span>
          </Button>
        ))}
      </div>

      <div className="toolbar-group">
        <Button
          variant="ghost"
          size="sm"
          className="toolbar-eraser"
          aria-label="Eraser"
          aria-pressed={tool.erasing}
          onClick={() => onToolChange({ ...tool, erasing: !tool.erasing })}
        >
          <span className="toolbar-block" />
        </Button>
      </div>

      <div className="toolbar-group">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          Export PNG
        </Button>
      </div>
    </div>
  )
}
