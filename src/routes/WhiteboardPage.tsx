import { useRef, useState } from 'react'
import { Panel } from '../components/Panel'
import { Toolbar } from '../whiteboard/Toolbar'
import { DEFAULT_TOOL, strokeStyleOf, type Tool } from '../whiteboard/tools'
import {
  WhiteboardCanvas,
  type WhiteboardHandle,
} from '../whiteboard/WhiteboardCanvas'
import './WhiteboardPage.css'

/**
 * The whiteboard's page. The board sits in a Panel: a bordered container with
 * a title and a body is what the glossary already calls one, and inventing a
 * second word for it is what the glossary exists to prevent.
 *
 * The tool in use lives here rather than in the drawing, which is deliberately
 * outside React and never re-renders: the toolbar has to redraw when the tool
 * changes, and the drawing does not.
 */
export function WhiteboardPage() {
  const [tool, setTool] = useState<Tool>(DEFAULT_TOOL)
  const board = useRef<WhiteboardHandle>(null)

  return (
    <main className="whiteboard-page">
      <Panel title="Whiteboard" headingLevel={1}>
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          onClear={() => board.current?.clear()}
          onExport={() => board.current?.exportPng()}
        />
        <WhiteboardCanvas ref={board} style={strokeStyleOf(tool)} />
      </Panel>
    </main>
  )
}
