/** PROTOTYPE HARNESS — throwaway. Floating variant switcher. Not production code. */
import { useEffect } from 'react'

export interface PrototypeVariant {
  key: string
  name: string
}

export function PrototypeSwitcher({
  variants,
  current,
  onChange,
}: {
  variants: PrototypeVariant[]
  current: string
  onChange: (key: string) => void
}) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  )

  const cycle = (delta: number) => {
    const next = variants[(index + delta + variants.length) % variants.length]
    onChange(next.key)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const el = document.activeElement
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      if (typing) return
      if (event.key === 'ArrowLeft') cycle(-1)
      if (event.key === 'ArrowRight') cycle(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (import.meta.env.PROD) return null

  return (
    <div className="proto-switcher">
      <button type="button" onClick={() => cycle(-1)} aria-label="Previous variant">
        &#8592;
      </button>
      <span>
        {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" onClick={() => cycle(1)} aria-label="Next variant">
        &#8594;
      </button>
    </div>
  )
}
