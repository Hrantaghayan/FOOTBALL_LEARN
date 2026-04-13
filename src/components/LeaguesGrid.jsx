import LeagueCard from './LeagueCard'
import { useLanguage } from '../context/LanguageContext'
import './LeaguesGrid.css'

function LeaguesGrid({ leagues, onEdit, onDelete }) {
  const { t } = useLanguage()

  if (leagues.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('grid.empty')}</p>
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
