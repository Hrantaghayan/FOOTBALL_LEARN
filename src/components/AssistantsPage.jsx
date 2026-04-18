import StatsTablePage from './StatsTablePage'

function AssistantsPage() {
  return (
    <StatsTablePage
      storageKey="footballAssistantsTable"
      bgStorageKey="footballAssistantsBg"
      defaultHeaderKeys={['assistants.header.player', 'assistants.header.team', 'assistants.header.count']}
      defaultWidths={[240, 220, 140]}
      imageColIndices={[0]}
      titleKey="assistants.defaultTitle"
      downloadName="assistants-table.png"
    />
  )
}

export default AssistantsPage
