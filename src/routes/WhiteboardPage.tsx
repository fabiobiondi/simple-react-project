import './WhiteboardPage.css'

/** The whiteboard's page. The surface itself arrives with the canvas. */
export function WhiteboardPage() {
  return (
    <main className="whiteboard-page">
      <h1>Whiteboard</h1>
      <div className="whiteboard-surface" />
    </main>
  )
}
