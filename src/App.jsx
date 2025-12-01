import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SearchPage from './components/SearchPage'
import RecommendationsPage from './components/RecommendationsPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
      </Routes>
    </Router>
  )
}

export default App
