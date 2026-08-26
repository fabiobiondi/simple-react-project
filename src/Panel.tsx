import { useId, type ReactNode } from 'react'
import './Panel.css'

export interface PanelProps {
  /** Labels the panel. Rich content is allowed, not just a string. */
  title: ReactNode
  /** The panel's body. */
  children?: ReactNode
}

export function Panel({ title, children }: PanelProps) {
  const titleId = useId()

  return (
    <section className="panel" aria-labelledby={titleId}>
      <h2 className="panel-title" id={titleId}>
        {title}
      </h2>
      <div className="panel-body">{children}</div>
    </section>
  )
}
