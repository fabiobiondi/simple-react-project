import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children as the accessible name', () => {
    render(<Button>Get started</Button>)

    expect(screen.getByRole('button', { name: 'Get started' })).toBeVisible()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Get started</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick while disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Get started
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Get started' }))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('passes native attributes through to the element', () => {
    render(<Button aria-label="Increment the counter" form="settings" />)

    expect(
      screen.getByRole('button', { name: 'Increment the counter' }),
    ).toHaveAttribute('form', 'settings')
  })

  it('defaults to type="button", so it never submits a form by accident', () => {
    render(<Button>Get started</Button>)

    expect(
      screen.getByRole('button', { name: 'Get started' }),
    ).toHaveAttribute('type', 'button')
  })

  it('lets a caller opt into submitting', () => {
    render(<Button type="submit">Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  // The class names are Button's public contract for styling, so they are worth
  // pinning even though asserting on classes is normally a smell.
  it('defaults to the primary variant at medium size', () => {
    render(<Button>Get started</Button>)

    const button = screen.getByRole('button', { name: 'Get started' })
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-md')
  })

  it('applies the requested variant and size', () => {
    render(
      <Button variant="ghost" size="lg">
        Get started
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Get started' })
    expect(button).toHaveClass('btn', 'btn-ghost', 'btn-lg')
  })

  it('does not leak variant and size onto the element as attributes', () => {
    render(
      <Button variant="secondary" size="sm">
        Get started
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Get started' })
    expect(button).not.toHaveAttribute('variant')
    expect(button).not.toHaveAttribute('size')
  })

  it("appends a caller's className instead of replacing its own", () => {
    render(<Button className="extra">Get started</Button>)

    const button = screen.getByRole('button', { name: 'Get started' })
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-md', 'extra')
  })

  it('leaves no stray whitespace in the class list when no className is given', () => {
    render(<Button>Get started</Button>)

    expect(screen.getByRole('button', { name: 'Get started' }).className).toBe(
      'btn btn-primary btn-md',
    )
  })
})
