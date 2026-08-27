import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from '../App'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('navigation', () => {
  it('opens on the page the app has always had', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: 'Get started' })).toBeVisible()
  })

  it('serves the whiteboard from its own address', () => {
    renderAt('/whiteboard')

    expect(screen.getByRole('heading', { name: 'Whiteboard' })).toBeVisible()
  })

  it('reaches the whiteboard from the home page by link', async () => {
    renderAt('/')

    await userEvent.click(screen.getByRole('link', { name: 'Whiteboard' }))

    expect(screen.getByRole('heading', { name: 'Whiteboard' })).toBeVisible()
  })

  it('reaches the home page from the whiteboard by link', async () => {
    renderAt('/whiteboard')

    await userEvent.click(screen.getByRole('link', { name: 'Home' }))

    expect(screen.getByRole('heading', { name: 'Get started' })).toBeVisible()
  })
})
