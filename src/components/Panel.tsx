import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import './Panel.css'

/** The real heading levels. A union rather than an enum: the build only permits erasable syntax. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * `title` is omitted from the native attributes: HTML's own `title` is a string
 * tooltip, and the panel's title is renderable content. One name, one meaning.
 */
export interface PanelProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Labels the panel. Rich content is allowed, not just a string. */
  title: ReactNode
  /** The panel's body. */
  children?: ReactNode
  /** Which heading element the title renders as, so panels sit correctly in the page's outline. */
  headingLevel?: HeadingLevel
  /** Decorative mark rendered before the title. Hidden from assistive technology. */
  icon?: ReactNode
  /** Content rendered after the body, inside the panel's border. */
  footer?: ReactNode
  /** Turns the title into a toggle that hides and reveals the body. */
  collapsible?: boolean
  /** Whether a collapsible panel starts open. Content is never hidden by accident. */
  defaultOpen?: boolean
}

export function Panel({
  title,
  children,
  headingLevel = 2,
  icon,
  footer,
  className,
  collapsible = false,
  defaultOpen = true,
  ...rest
}: PanelProps) {
  const titleId = useId()
  const bodyId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const Heading = `h${headingLevel}` as const

  const classes = ['panel', className].filter(Boolean).join(' ')

  return (
    // `rest` is spread first so a caller can never displace the generated label
    // association that makes this a named region.
    <section {...rest} className={classes} aria-labelledby={titleId}>
      {icon ? (
        <span className="panel-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <Heading className="panel-title" id={titleId}>
        {collapsible ? (
          <button
            type="button"
            className="panel-toggle"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          >
            {title}
          </button>
        ) : (
          title
        )}
      </Heading>
      {/*
        Hidden via the `hidden` attribute rather than a CSS display rule: that is
        what takes collapsed content out of the accessibility tree AND out of the
        tab order. The body stays mounted, so state inside it survives a cycle.
      */}
      <div className="panel-body" id={bodyId} hidden={collapsible && !open}>
        {children}
      </div>
      {footer ? <div className="panel-footer">{footer}</div> : null}
    </section>
  )
}
