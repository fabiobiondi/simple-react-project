import { Panel } from '../components/Panel'
import { WhiteboardCanvas } from '../whiteboard/WhiteboardCanvas'
import './WhiteboardPage.css'

/**
 * The whiteboard's page. The board sits in a Panel: a bordered container with
 * a title and a body is what the glossary already calls one, and inventing a
 * second word for it is what the glossary exists to prevent.
 */
export function WhiteboardPage() {
  return (
    <main className="whiteboard-page">
      <Panel title="Whiteboard" headingLevel={1}>
        <WhiteboardCanvas />
      </Panel>
    </main>
  )
}
