import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Modal from './components/Modal'
import Header from './components/Header'
import LeaguesGrid from './components/LeaguesGrid'
import PrintButton from './components/PrintButton'
import SecondPage from './components/SecondPage'
import GamesPage from './components/GamesPage'
import SchedulePage from './components/SchedulePage'
import LoginModal from './components/LoginModal'
import './App.css'

function MainPage() {
  const [leagues, setLeagues] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [titleImage, setTitleImage] = useState('/conference-league-hd.jpeg')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingLeagueIndex, setEditingLeagueIndex] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedLeagues = localStorage.getItem('footballLeagues')

    if (savedLeagues) {
      const parsed = JSON.parse(savedLeagues)
      setLeagues(parsed)
      if (parsed.length >= 8) {
        setIsModalOpen(false)
      }
    }

    localStorage.clear()
  }, [])

  useEffect(() => {
    localStorage.setItem('footballLeagues', JSON.stringify(leagues))
  }, [leagues])

  const handleAddLeague = (league) => {
    if (isEditMode && editingLeagueIndex !== null) {
      const updatedLeagues = [...leagues]
      updatedLeagues[editingLeagueIndex] = league
      setLeagues(updatedLeagues)
      setIsEditMode(false)
      setEditingLeagueIndex(null)
      if (leagues.length >= 8) {
        setIsModalOpen(false)
      }
    } else {
      const newLeagues = [...leagues, league]
      setLeagues(newLeagues)
      if (newLeagues.length >= 8) {
        setIsModalOpen(false)
      }
    }
  }

  const handleEditLeague = (index) => {
    setEditingLeagueIndex(index)
    setIsEditMode(true)
    setIsModalOpen(true)
  }

  const handleDeleteLeague = (index) => {
    const updatedLeagues = leagues.filter((_, i) => i !== index)
    setLeagues(updatedLeagues)
  }

  const handleReset = () => {
    setLeagues([])
    setTitleImage('/conference-league-hd.jpeg')
    localStorage.removeItem('footballLeagues')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditingLeagueIndex(null)
  }

  const handleOpenModal = () => {
    setIsEditMode(false)
    setEditingLeagueIndex(null)
    setIsModalOpen(true)
  }

  return (
    <div className="app">
      {isModalOpen && (
        <Modal
          onAddLeague={handleAddLeague}
          leagueCount={leagues.length}
          onClose={handleCloseModal}
          isEditMode={isEditMode}
          editingLeague={isEditMode && editingLeagueIndex !== null ? leagues[editingLeagueIndex] : null}
        />
      )}

      <div className="main-content">
        <Header
          titleImage={titleImage}
        />

        <LeaguesGrid
          leagues={leagues}
          onEdit={handleEditLeague}
          onDelete={handleDeleteLeague}
        />

        <div className="action-buttons no-print">
          <button className="add-more-btn" onClick={handleOpenModal}>
            {leagues.length < 8 ? `Add League (${leagues.length}/8)` : 'Add More Leagues'}
          </button>
          <PrintButton />
          <button className="reset-btn" onClick={handleReset}>
            Reset All
          </button>
          <button className="add-more-btn" onClick={() => navigate('/second')}>
            Go to Second Page
          </button>
          <button className="add-more-btn" onClick={() => navigate('/games')}>
            Games
          </button>
          <button className="add-more-btn schedule-btn" onClick={() => navigate('/schedule')}>
            Create Game Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <LoginModal />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/second" element={<SecondPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </>
  )
}

export default App
