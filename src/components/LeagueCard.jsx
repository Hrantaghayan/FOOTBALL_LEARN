import './LeagueCard.css'

function LeagueCard({ league, index, onEdit, onDelete }) {
  return (
    <div className="league-card">
      <div className="league-header">
        {league.logo && (
          <img src={league.logo} alt={`${league.name} logo`} className="league-logo" />
        )}
        <h3 className="league-name">{league.name}</h3>
        <div className="league-actions no-print">
          <button className="edit-btn" onClick={onEdit} title="Edit">
            &#9998;
          </button>
          <button className="delete-btn" onClick={onDelete} title="Delete">
            &times;
          </button>
        </div>
      </div>
      <ul className="team-list">
        {league.teams.map((team, teamIndex) => (
          <li key={teamIndex} className={`team-item ${teamIndex === 4 || teamIndex === 5 ? 'europa-spots' : ''}`}>
            <span className="team-rank">{teamIndex + 1}</span>
            <span className="team-name">{team}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LeagueCard
