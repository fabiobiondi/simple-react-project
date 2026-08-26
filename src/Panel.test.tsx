import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Panel } from './Panel'

describe('Panel', () => {
  it('renders its title as a heading', () => {
    render(<Panel title="Documentation">Your questions, answered</Panel>)

    expect(
      screen.getByRole('heading', { name: 'Documentation' }),
    ).toBeInTheDocument()
  })

  it('renders its children as content', () => {
    render(
      <Panel title="Documentation">
        <p>Your questions, answered</p>
      </Panel>,
    )

    expect(screen.getByText('Your questions, answered')).toBeInTheDocument()
  })

  it('is exposed as a region named by its title', () => {
    render(<Panel title="Documentation">Your questions, answered</Panel>)

    expect(screen.getByRole('region', { name: 'Documentation' })).toBeVisible()
  })

  it('accepts rich content as a title', () => {
    render(
      <Panel
        title={
          <>
            Connect with <em>us</em>
          </>
        }
      >
        Join the community
      </Panel>,
    )

    expect(
      screen.getByRole('heading', { name: 'Connect with us' }),
    ).toBeInTheDocument()
  })

  it('gives each panel on the page its own label, so regions stay distinguishable', () => {
    render(
      <>
        <Panel title="Documentation">Your questions, answered</Panel>
        <Panel title="Connect with us">Join the community</Panel>
      </>,
    )

    expect(screen.getAllByRole('region')).toHaveLength(2)
    expect(screen.getByRole('region', { name: 'Documentation' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Connect with us' })).toBeVisible()
  })
})
