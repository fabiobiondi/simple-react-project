import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

  it('renders its title at level 2 by default', () => {
    render(<Panel title="Documentation">Your questions, answered</Panel>)

    expect(
      screen.getByRole('heading', { name: 'Documentation', level: 2 }),
    ).toBeInTheDocument()
  })

  it('renders its title at the requested heading level', () => {
    render(
      <Panel title="Documentation" headingLevel={3}>
        Your questions, answered
      </Panel>,
    )

    expect(
      screen.getByRole('heading', { name: 'Documentation', level: 3 }),
    ).toBeInTheDocument()
  })

  it('renders an icon before the title when given one', () => {
    render(
      <Panel title="Documentation" icon={<span>sparkles</span>}>
        Your questions, answered
      </Panel>,
    )

    const icon = screen.getByText('sparkles')
    const heading = screen.getByRole('heading', { name: 'Documentation' })
    expect(
      icon.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('marks the icon decorative, so it stays out of the accessibility tree', () => {
    render(
      <Panel title="Documentation" icon={<img alt="sparkles" />}>
        Your questions, answered
      </Panel>,
    )

    expect(
      screen.queryByRole('img', { name: 'sparkles' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Documentation' })).toBeVisible()
  })

  it('renders a footer after the body, inside the labelled region', () => {
    render(
      <Panel title="Documentation" footer={<a href="/more">Read more</a>}>
        Your questions, answered
      </Panel>,
    )

    const region = screen.getByRole('region', { name: 'Documentation' })
    const footerLink = screen.getByRole('link', { name: 'Read more' })
    expect(region).toContainElement(footerLink)
  })

  it('renders no icon or footer content when given neither', () => {
    render(<Panel title="Documentation">Your questions, answered</Panel>)

    expect(screen.getByRole('region', { name: 'Documentation' })).toHaveTextContent(
      /^DocumentationYour questions, answered$/,
    )
  })

  // The one deliberate exception to this suite's no-class-name rule: the
  // criterion itself is about class composition, so there is no accessible
  // surface to assert against. See issue #3.
  it("appends a caller's class name without replacing its own", () => {
    const { container } = render(
      <Panel title="Documentation" className="wide">
        Your questions, answered
      </Panel>,
    )

    expect(container.querySelector('.panel.wide')).toBeInTheDocument()
  })

  it('passes standard container attributes through to the root', () => {
    render(
      <Panel title="Documentation" id="docs" data-section="reference">
        Your questions, answered
      </Panel>,
    )

    const region = screen.getByRole('region', { name: 'Documentation' })
    expect(region).toHaveAttribute('id', 'docs')
    expect(region).toHaveAttribute('data-section', 'reference')
  })

  it('is not collapsible by default: no toggle, body always shown', () => {
    render(<Panel title="Documentation">Your questions, answered</Panel>)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Your questions, answered')).toBeVisible()
  })

  it('exposes a collapsible panel as a toggle named by its title', () => {
    render(
      <Panel title="Documentation" collapsible>
        Your questions, answered
      </Panel>,
    )

    expect(
      screen.getByRole('button', { name: 'Documentation', expanded: true }),
    ).toBeInTheDocument()
  })

  it('points the toggle at the body it controls', () => {
    render(
      <Panel title="Documentation" collapsible>
        Your questions, answered
      </Panel>,
    )

    const toggle = screen.getByRole('button', { name: 'Documentation' })
    const controlled = document.getElementById(
      toggle.getAttribute('aria-controls') ?? '',
    )

    expect(controlled).toHaveTextContent('Your questions, answered')
  })

  it('hides the body when the toggle is activated, and reveals it again', async () => {
    render(
      <Panel title="Documentation" collapsible>
        Your questions, answered
      </Panel>,
    )
    const toggle = screen.getByRole('button', { name: 'Documentation' })

    await userEvent.click(toggle)
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(screen.getByText('Your questions, answered')).toBeVisible()
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('reaches the toggle by tabbing and activates it with Enter', async () => {
    render(
      <Panel title="Documentation" collapsible>
        Your questions, answered
      </Panel>,
    )

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Documentation' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
  })

  it('activates the toggle with Space', async () => {
    render(
      <Panel title="Documentation" collapsible>
        Your questions, answered
      </Panel>,
    )

    await userEvent.tab()
    await userEvent.keyboard('{ }')

    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
  })

  it('takes a collapsed body out of the accessibility tree and the tab order', async () => {
    render(
      <>
        <Panel title="Documentation" collapsible>
          <a href="/more">Read more</a>
        </Panel>
        <button type="button">After the panel</button>
      </>,
    )
    const toggle = screen.getByRole('button', { name: 'Documentation' })

    await userEvent.click(toggle)

    expect(
      screen.queryByRole('link', { name: 'Read more' }),
    ).not.toBeInTheDocument()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'After the panel' })).toHaveFocus()
  })

  it('starts closed when asked to', () => {
    render(
      <Panel title="Documentation" collapsible defaultOpen={false}>
        Your questions, answered
      </Panel>,
    )

    expect(
      screen.getByRole('button', { name: 'Documentation', expanded: false }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
  })

  it('keeps state typed into the body across a collapse and expand', async () => {
    render(
      <Panel title="Documentation" collapsible>
        <input aria-label="Search" />
      </Panel>,
    )
    const toggle = screen.getByRole('button', { name: 'Documentation' })
    await userEvent.type(screen.getByLabelText('Search'), 'vite')

    await userEvent.click(toggle)
    await userEvent.click(toggle)

    expect(screen.getByLabelText('Search')).toHaveValue('vite')
  })

  it('toggles two panels on a page independently', async () => {
    render(
      <>
        <Panel title="Documentation" collapsible>
          Your questions, answered
        </Panel>
        <Panel title="Connect with us" collapsible>
          Join the community
        </Panel>
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Documentation' }))

    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
    expect(screen.getByText('Join the community')).toBeVisible()
  })

  it('renders what a controlled panel is told, ignoring its own activation', async () => {
    render(
      <Panel title="Documentation" collapsible open={false}>
        Your questions, answered
      </Panel>,
    )
    const toggle = screen.getByRole('button', { name: 'Documentation' })
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()

    await userEvent.click(toggle)

    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('reports the state a controlled panel wants to be in', async () => {
    const onOpenChange = vi.fn()
    render(
      <Panel
        title="Documentation"
        collapsible
        open={false}
        onOpenChange={onOpenChange}
      >
        Your questions, answered
      </Panel>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Documentation' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('follows its prop when a controlled panel is re-rendered', () => {
    const { rerender } = render(
      <Panel title="Documentation" collapsible open={false}>
        Your questions, answered
      </Panel>,
    )
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()

    rerender(
      <Panel title="Documentation" collapsible open>
        Your questions, answered
      </Panel>,
    )

    expect(screen.getByText('Your questions, answered')).toBeVisible()
  })

  it('ignores the initial-state prop entirely when controlled', () => {
    render(
      <Panel title="Documentation" collapsible defaultOpen={false} open>
        Your questions, answered
      </Panel>,
    )

    expect(screen.getByText('Your questions, answered')).toBeVisible()
  })

  it('reports state changes in uncontrolled mode too, without taking ownership', async () => {
    const onOpenChange = vi.fn()
    render(
      <Panel title="Documentation" collapsible onOpenChange={onOpenChange}>
        Your questions, answered
      </Panel>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Documentation' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByText('Your questions, answered')).not.toBeVisible()
  })
})
