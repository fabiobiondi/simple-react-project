import { Route, Routes } from 'react-router'
import { HomePage } from './routes/HomePage'
import { SiteLayout } from './routes/SiteLayout'
import { WhiteboardPage } from './routes/WhiteboardPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="whiteboard" element={<WhiteboardPage />} />
      </Route>
    </Routes>
  )
}

export default App
