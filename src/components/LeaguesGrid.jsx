import LeagueCard from './LeagueCard'
import './LeaguesGrid.css'

function LeaguesGrid({ leagues, onEdit, onDelete }) {
  if (leagues.length === 0) {
    return (
      <div className="empty-state">
        <p>No leagues added yet. Add your first league to get started!</p>
      </div>
    )
  }

  return (
    <div className="leagues-grid">
      {leagues.map((league, index) => (
        <LeagueCard
          key={index}
          league={league}
          index={index}
          onEdit={() => onEdit(index)}
          onDelete={() => onDelete(index)}
        />
      ))}
    </div>
  )
}

export default LeaguesGrid
