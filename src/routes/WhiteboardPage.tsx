import { WhiteboardCanvas } from '../whiteboard/WhiteboardCanvas'
import './WhiteboardPage.css'

/** The whiteboard's page: a heading, and the surface below it. */
export function WhiteboardPage() {
  return (
    <main className="whiteboard-page">
      <h1>Whiteboard</h1>
      <div className="whiteboard-surface">
        <WhiteboardCanvas />
      </div>
    </main>
  )
}
