import { useState, useEffect, useRef } from 'react'
import './Modal.css'

function Modal({ onAddLeague, leagueCount, onClose, isEditMode, editingLeague }) {
  const [leagueName, setLeagueName] = useState('')
  const [teams, setTeams] = useState(Array(11).fill(''))
  const [leagueLogo, setLeagueLogo] = useState('')
  const [error, setError] = useState('')
  const logoInputRef = useRef(null)

  useEffect(() => {
    if (isEditMode && editingLeague) {
      setLeagueName(editingLeague.name)
      setTeams(editingLeague.teams)
      setLeagueLogo(editingLeague.logo || '')
    } else {
      setLeagueName('')
      setTeams(Array(11).fill(''))
      setLeagueLogo('')
    }
  }, [isEditMode, editingLeague])

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLeagueLogo(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLeagueLogo('')
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
  }

  const handleTeamChange = (index, value) => {
    const newTeams = [...teams]
    newTeams[index] = value
    setTeams(newTeams)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!leagueName.trim()) {
      setError('Please enter a league name')
      return
    }

    const filledTeams = teams.filter(team => team.trim() !== '')
    if (filledTeams.length < 11) {
      setError(`Please enter all 11 teams (${filledTeams.length}/11 entered)`)
      return
    }

    onAddLeague({
      name: leagueName.trim(),
      teams: teams.map(t => t.trim()),
      logo: leagueLogo
    })

    // Reset form
    setLeagueName('')
    setTeams(Array(11).fill(''))
    setLeagueLogo('')
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit League' : 'Add New League'}</h2>
          <span className="league-counter">{leagueCount} Leagues Added</span>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="leagueName">League Name</label>
            <input
              type="text"
              id="leagueName"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              placeholder="e.g., Premier League"
              className="league-input"
            />
          </div>

          <div className="form-group">
            <label>League Logo (Optional)</label>
            <div className="logo-upload-container">
              {leagueLogo ? (
                <div className="logo-preview">
                  <img src={leagueLogo} alt="League logo" className="logo-preview-img" />
                  <button type="button" className="remove-logo-btn" onClick={handleRemoveLogo}>
                    &times;
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="upload-logo-btn"
                  onClick={() => logoInputRef.current?.click()}
                >
                  + Upload Logo
                </button>
              )}
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="teams-section">
            <label>Team Names (11 teams required)</label>
            <div className="teams-grid">
              {teams.map((team, index) => (
                <div key={index} className="team-input-wrapper">
                  <span className="team-number">{index + 1}</span>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => handleTeamChange(index, e.target.value)}
                    placeholder={`Team ${index + 1}`}
                    className="team-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              {isEditMode ? 'Update League' : 'Add League'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Modal
