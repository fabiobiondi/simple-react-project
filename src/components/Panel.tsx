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
  /**
   * Takes ownership of the open state. Its presence selects controlled mode.
   * Only meaningful alongside `collapsible`: a panel that cannot collapse has
   * no state and always renders its body.
   */
  open?: boolean
  /** Called with the state the panel would like to be in. Fires in both modes. */
  onOpenChange?: (open: boolean) => void
}

/**
 * A panel takes its text alignment from the page rather than declaring one, so
 * a panel placed in centred content is centred. See issue #9.
 */
export function Panel({
  title,
  children,
  headingLevel = 2,
  icon,
  footer,
  className,
  collapsible = false,
  defaultOpen = true,
  open,
  onOpenChange,
  ...rest
}: PanelProps) {
  const titleId = useId()
  const bodyId = useId()
  // Presence of `open` selects controlled mode: the panel then renders exactly
  // what it is told and never changes state on its own, so there is one source
  // of truth. `defaultOpen` seeds the uncontrolled state only.
  const isControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = isControlled ? open : uncontrolledOpen

  const requestToggle = () => {
    const wanted = !isOpen
    // Updater form so two toggles dispatched in one batch cannot collapse into
    // one, even though `wanted` is what the consumer is told.
    if (!isControlled) setUncontrolledOpen((wasOpen) => !wasOpen)
    onOpenChange?.(wanted)
  }
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
            aria-expanded={isOpen}
            aria-controls={bodyId}
            onClick={requestToggle}
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
      <div className="panel-body" id={bodyId} hidden={collapsible && !isOpen}>
        {children}
      </div>
      {footer ? <div className="panel-footer">{footer}</div> : null}
    </section>
  )
}
