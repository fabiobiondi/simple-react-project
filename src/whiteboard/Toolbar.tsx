import { Button } from '../components/Button'
import type { StrokeStyle } from './drawing'
import { COLOURS, WIDTHS } from './tools'
import './Toolbar.css'

export interface ToolbarProps {
  /** What the next stroke will be drawn with. */
  tool: StrokeStyle
  /** Called with the tool the toolbar would like to be in use. */
  onToolChange: (tool: StrokeStyle) => void
}

/**
 * The whiteboard's tools. Holds no state of its own: it is told what is in
 * use and asks for a change, so there is one source of truth.
 *
 * Choices are Buttons, and their pressed state is what says which is in use —
 * that is the part a screen reader can hear, where the coloured swatch is not.
 */
export function Toolbar({ tool, onToolChange }: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Drawing tools">
      <div className="toolbar-group">
        {COLOURS.map((colour) => (
          <Button
            key={colour.value}
            variant="ghost"
            size="sm"
            className="toolbar-colour"
            aria-label={colour.name}
            aria-pressed={tool.color === colour.value}
            onClick={() => onToolChange({ ...tool, color: colour.value })}
          >
            <span
              className="toolbar-swatch"
              style={{ background: colour.value }}
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
            {/* Ink on paper: the nib is the colour in use, so it needs the
                board's white behind it rather than the page's background. */}
            <span className="toolbar-paper">
              <span
                className="toolbar-nib"
                style={{
                  inlineSize: `${width.value}px`,
                  blockSize: `${width.value}px`,
                  background: tool.color,
                }}
              />
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}
