import type { ComponentProps } from 'react'
import './Button.css'

export interface ButtonProps extends ComponentProps<'button'> {
  /**
   * Visual weight. `primary` for the page's main action, `secondary` for
   * alternatives, `ghost` for low-emphasis actions.
   */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Control size. */
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
