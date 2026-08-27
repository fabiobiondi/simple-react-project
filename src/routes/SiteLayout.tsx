import { Link, Outlet } from 'react-router'
import './SiteLayout.css'

/**
 * The navigation both pages share. These are links, not Buttons: they go
 * somewhere rather than doing something, so they stay anchors.
 */
export function SiteLayout() {
  return (
    <>
      <nav className="site-nav" aria-label="Pages">
        <Link to="/">Home</Link>
        <Link to="/whiteboard">Whiteboard</Link>
      </nav>
      <Outlet />
    </>
  )
}
