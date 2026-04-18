import StatsTablePage from './StatsTablePage'

function ScorersPage() {
  return (
    <StatsTablePage
      storageKey="footballScorersTable"
      bgStorageKey="footballScorersBg"
      defaultHeaderKeys={['scorers.header.player', 'scorers.header.team', 'scorers.header.count']}
      defaultWidths={[240, 220, 140]}
      imageColIndices={[0]}
      titleKey="scorers.defaultTitle"
      downloadName="scorers-table.png"
    />
  )
}

export default ScorersPage
