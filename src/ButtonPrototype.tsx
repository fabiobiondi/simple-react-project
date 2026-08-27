/**
 * PROTOTYPE — throwaway, delete before merge.
 *
 * Question: what should Button's primary/secondary/ghost x sm/md/lg look like,
 * given the decision that Button owns its own colours (no shared token contract)?
 *
 * Three button design languages, switchable via ?variant= on the existing page.
 * Each variant hand-writes its own palette AND its own dark-mode block, which is
 * what "owns its own colours" actually costs.
 */
import { useState } from 'react'
import { PrototypeSwitcher, type PrototypeVariant } from './PrototypeSwitcher'
import './ButtonPrototype.css'

const VARIANTS: PrototypeVariant[] = [
  { key: 'A', name: 'Solid' },
  { key: 'B', name: 'Tinted' },
  { key: 'C', name: 'Sharp' },
]

const PREFIX: Record<string, string> = { A: 'pa', B: 'pb', C: 'pc' }

const BLURB: Record<string, string> = {
  A: 'Filled primary, outlined secondary, bare ghost. The default of every design system — highest contrast, most obvious hierarchy, least like the rest of this app.',
  B: 'Extends the idiom already in App.css: tinted background, transparent 2px border that colours in on hover. Quietest, and the only one that looks native to this page.',
  C: 'Square, mono, uppercase, hard offset shadow on hover. Most opinionated; commits the app to a personality it does not currently have.',
}

const KINDS = ['primary', 'secondary', 'ghost'] as const
const SIZES = ['sm', 'md', 'lg'] as const

const STATES = [
  { label: 'default', cls: '', disabled: false },
  { label: 'hover', cls: 'is-hover', disabled: false },
  { label: 'active', cls: 'is-active', disabled: false },
  { label: 'focus', cls: 'is-focus', disabled: false },
  { label: 'disabled', cls: '', disabled: true },
]

function readVariant() {
  const value = new URLSearchParams(window.location.search).get('variant')
  return VARIANTS.some((v) => v.key === value) ? (value as string) : 'A'
}

function Gallery({ prefix }: { prefix: string }) {
  return (
    <div className="proto-gallery">
      {KINDS.map((kind) => (
        <div className="proto-row" key={kind}>
          <h3>{kind}</h3>

          <div className="proto-strip">
            {SIZES.map((size) => (
              <span className="proto-cell" key={size}>
                <button
                  type="button"
                  className={`${prefix}-btn ${prefix}-${kind} ${prefix}-${size}`}
                >
                  Get started
                </button>
                <em>{size}</em>
              </span>
            ))}
          </div>

          <div className="proto-strip">
            {STATES.map((state) => (
              <span className="proto-cell" key={state.label}>
                <button
                  type="button"
                  disabled={state.disabled}
                  className={`${prefix}-btn ${prefix}-${kind} ${prefix}-md ${state.cls}`}
                >
                  Get started
                </button>
                <em>{state.label}</em>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ButtonPrototype() {
  const [variant, setVariant] = useState(readVariant)

  const select = (key: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('variant', key)
    window.history.replaceState(null, '', url)
    setVariant(key)
  }

  return (
    <section className="proto-section">
      <h2>Button prototype &mdash; variant {variant}</h2>
      <p className="proto-blurb">{BLURB[variant]}</p>
      <Gallery prefix={PREFIX[variant]} />
      <PrototypeSwitcher variants={VARIANTS} current={variant} onChange={select} />
    </section>
  )
}
