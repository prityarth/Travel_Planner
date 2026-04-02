import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import PlanTrip from './pages/PlanTrip'
import SavedTrips from './pages/SavedTrips'
import Navbar from './components/Navbar'
import { Chatbot } from './components/Chatbot'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/saved" element={<SavedTrips />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  )
}

export default App
