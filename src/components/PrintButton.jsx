import './PrintButton.css'
import { useLanguage } from '../context/LanguageContext'

function PrintButton() {
  const { t } = useLanguage()

  return (
    <button className="print-btn" onClick={() => window.print()}>
      {t('app.print')}
    </button>
  )
}

export default PrintButton
