import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import MoodDetector from './components/moodDetector'
import Player from "./components/Player"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MoodDetector />} />
        <Route path="player/:trackId" element={<Player />} />
      </Routes>
    </Router>
  )
}

export default App
