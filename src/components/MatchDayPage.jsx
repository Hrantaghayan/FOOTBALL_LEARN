import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { useLanguage } from '../context/LanguageContext'
import './MatchDayPage.css'

const BG_STORAGE_KEY = 'footballMatchDayBg'
const BG_RATIO_STORAGE_KEY = 'footballMatchDayBgRatio'
const DATA_STORAGE_KEY = 'footballMatchDayData'

const MATCH_COUNT = 2
const makeEmptyTeam = () => ({ logo: null, name: '' })
const makeEmptyMatches = () =>
  Array.from({ length: MATCH_COUNT }, () => ({
    home: makeEmptyTeam(),
    away: makeEmptyTeam(),
    dateTime: '',
  }))

function MatchDayPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const bgInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const pendingSlotRef = useRef(null)
  const pageRef = useRef(null)
  const toolbarRef = useRef(null)
  const posterRef = useRef(null)

  const [bgImage, setBgImage] = useState(() => localStorage.getItem(BG_STORAGE_KEY) || null)
  const [bgAspectRatio, setBgAspectRatio] = useState(() => {
    const v = parseFloat(localStorage.getItem(BG_RATIO_STORAGE_KEY))
    return Number.isFinite(v) && v > 0 ? v : null
  })
  const [showInstructions, setShowInstructions] = useState(false)
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem(DATA_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length === MATCH_COUNT) {
          return parsed.map((m) => ({
            home: m?.home ?? makeEmptyTeam(),
            away: m?.away ?? makeEmptyTeam(),
            dateTime: typeof m?.dateTime === 'string' ? m.dateTime : '',
          }))
        }
      } catch {
        // ignore
      }
    }
    return makeEmptyMatches()
  })

  useEffect(() => {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(matches))
  }, [matches])

  useEffect(() => {
    if (bgImage) localStorage.setItem(BG_STORAGE_KEY, bgImage)
    else localStorage.removeItem(BG_STORAGE_KEY)
  }, [bgImage])

  useEffect(() => {
    if (bgAspectRatio) localStorage.setItem(BG_RATIO_STORAGE_KEY, String(bgAspectRatio))
    else localStorage.removeItem(BG_RATIO_STORAGE_KEY)
  }, [bgAspectRatio])

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setBgAspectRatio(img.naturalWidth / img.naturalHeight)
      }
      setBgImage(dataUrl)
    }
    img.src = dataUrl
  }

  const handleRemoveBg = () => {
    setBgImage(null)
    setBgAspectRatio(null)
  }

  const handleOpenLogoPicker = (matchIdx, side) => {
    pendingSlotRef.current = { matchIdx, side }
    logoInputRef.current?.click()
  }

  const handleLogoSelected = async (e) => {
    const file = e.target.files?.[0]
    const target = pendingSlotRef.current
    e.target.value = ''
    pendingSlotRef.current = null
    if (!file || !target) return
    const dataUrl = await fileToDataUrl(file)
    setMatches((prev) => {
      const next = prev.map((m) => ({ home: { ...m.home }, away: { ...m.away }, dateTime: m.dateTime }))
      next[target.matchIdx][target.side].logo = dataUrl
      return next
    })
  }

  const handleRemoveLogo = (matchIdx, side) => {
    setMatches((prev) => {
      const next = prev.map((m) => ({ home: { ...m.home }, away: { ...m.away }, dateTime: m.dateTime }))
      next[matchIdx][side].logo = null
      return next
    })
  }

  const handleNameChange = (matchIdx, side, value) => {
    setMatches((prev) => {
      const next = prev.map((m) => ({ home: { ...m.home }, away: { ...m.away }, dateTime: m.dateTime }))
      next[matchIdx][side].name = value
      return next
    })
  }

  const handleDateTimeChange = (matchIdx, value) => {
    setMatches((prev) => {
      const next = prev.map((m) => ({ home: { ...m.home }, away: { ...m.away }, dateTime: m.dateTime }))
      next[matchIdx].dateTime = value
      return next
    })
  }

  const handleClear = () => {
    setMatches(makeEmptyMatches())
  }

  const handleSnapshot = async () => {
    const poster = posterRef.current
    const toolbar = toolbarRef.current
    if (!poster) return

    toolbar.style.display = 'none'
    poster.classList.add('snapshot-mode')

    const prevBgImage = poster.style.backgroundImage
    const prevBgSize = poster.style.backgroundSize
    const prevBgPosition = poster.style.backgroundPosition
    const prevBgRepeat = poster.style.backgroundRepeat
    const prevBgColor = poster.style.backgroundColor

    if (bgImage) {
      poster.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${bgImage})`
      poster.style.backgroundSize = '100% 100%, 100% 100%'
      poster.style.backgroundPosition = 'center, center'
      poster.style.backgroundRepeat = 'no-repeat, no-repeat'
    } else {
      poster.style.backgroundColor = '#0a0a0a'
    }

    await new Promise((r) => setTimeout(r, 80))

    const canvas = await html2canvas(poster, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a0a',
      scale: 2,
    })

    toolbar.style.display = ''
    poster.classList.remove('snapshot-mode')
    poster.style.backgroundImage = prevBgImage
    poster.style.backgroundSize = prevBgSize
    poster.style.backgroundPosition = prevBgPosition
    poster.style.backgroundRepeat = prevBgRepeat
    poster.style.backgroundColor = prevBgColor

    const link = document.createElement('a')
    link.download = 'match-day.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const renderTeamSlot = (matchIdx, side) => {
    const team = matches[matchIdx][side]
    return (
      <div className="md-team">
        <div className="md-logo-wrap">
          {team.logo ? (
            <>
              <img src={team.logo} alt="" className="md-logo" />
              <button
                className="md-logo-remove no-print"
                onClick={() => handleRemoveLogo(matchIdx, side)}
                aria-label="Remove logo"
              >
                ×
              </button>
            </>
          ) : (
            <button
              className="md-logo-add no-print"
              onClick={() => handleOpenLogoPicker(matchIdx, side)}
              aria-label="Upload logo"
              title={t('matchDay.uploadLogoTitle')}
            >
              +
            </button>
          )}
        </div>
        <input
          className="md-team-name"
          type="text"
          value={team.name}
          onChange={(e) => handleNameChange(matchIdx, side, e.target.value)}
          placeholder={t('matchDay.teamPlaceholder')}
        />
      </div>
    )
  }

  return (
    <div
      className="match-day-page"
      ref={pageRef}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="md-toolbar no-print" ref={toolbarRef}>
        <button className="md-btn back" onClick={() => navigate('/')}>
          {t('matchDay.back')}
        </button>
        <button className="md-btn bg-upload" onClick={() => bgInputRef.current?.click()}>
          {bgImage ? t('matchDay.changeBg') : t('matchDay.uploadBg')}
        </button>
        {bgImage && (
          <button className="md-btn rem-bg" onClick={handleRemoveBg}>
            {t('matchDay.removeBg')}
          </button>
        )}
        <button
          className="md-btn info"
          onClick={() => setShowInstructions((v) => !v)}
        >
          {t('matchDay.bgTips')}
        </button>
        <button className="md-btn snapshot" onClick={handleSnapshot}>
          {t('matchDay.snapshot')}
        </button>
        <button className="md-btn clear" onClick={handleClear}>
          {t('matchDay.clear')}
        </button>
      </div>

      {showInstructions && (
        <div className="md-instructions no-print">
          <button
            className="md-instructions-close"
            onClick={() => setShowInstructions(false)}
            aria-label="Close"
          >
            ×
          </button>
          <h3>{t('matchDay.bgTipsTitle')}</h3>
          <ul>
            <li>{t('matchDay.tip1')}</li>
            <li>{t('matchDay.tip2')}</li>
            <li>{t('matchDay.tip3')}</li>
            <li>{t('matchDay.tip4')}</li>
            <li>{t('matchDay.tip5')}</li>
          </ul>
        </div>
      )}

      <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgUpload} />
      <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={handleLogoSelected} />

      <div className="md-poster" ref={posterRef}>
        <div className="md-title">
          <div className="md-title-line md-title-football">FOOTBALL</div>
          <div className="md-title-line md-title-match">MATCH</div>
          <div className="md-title-line md-title-day">DAY</div>
        </div>

        <div className="md-matches">
          {matches.map((match, idx) => (
            <div className="md-match-row" key={idx}>
              <div className="md-match-corner tl" />
              <div className="md-match-corner tr" />
              <div className="md-match-corner bl" />
              <div className="md-match-corner br" />
              {renderTeamSlot(idx, 'home')}
              <div className="md-center">
                <div className="md-vs">VS</div>
                <input
                  className="md-datetime"
                  type="text"
                  value={match.dateTime}
                  onChange={(e) => handleDateTimeChange(idx, e.target.value)}
                  placeholder={t('matchDay.dateTimePlaceholder')}
                />
              </div>
              {renderTeamSlot(idx, 'away')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MatchDayPage
