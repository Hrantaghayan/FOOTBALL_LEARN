import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { useLanguage } from '../context/LanguageContext'
import './GamesPage.css'

const DEFAULT_HEADERS = ['Date', 'Home Team', 'Away Team', 'Score', 'Venue', 'Status']

const GAMES_HEADER_DEFAULTS = {
  'Date': 'games.header.date',
  'Home Team': 'games.header.homeTeam',
  'Away Team': 'games.header.awayTeam',
  'Score': 'games.header.score',
  'Venue': 'games.header.venue',
  'Status': 'games.header.status',
  'Дата': 'games.header.date',
  'Хозяева': 'games.header.homeTeam',
  'Гости': 'games.header.awayTeam',
  'Счёт': 'games.header.score',
  'Место': 'games.header.venue',
  'Статус': 'games.header.status',
}
const DEFAULT_WIDTHS = [110, 200, 200, 120, 150, 140]
const DEFAULT_COL_WIDTH = 150
const MIN_COL_WIDTH = 50
const STORAGE_KEY = 'footballGamesTable'
const BG_STORAGE_KEY = 'footballGamesBg'

const makeEmptyCell = () => ({ text: '', image: null })
const makeEmptyRow = (cols) => Array.from({ length: cols }, makeEmptyCell)

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

function GamesPage() {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const fileInputRef = useRef(null)
  const bgInputRef = useRef(null)
  const pendingCellRef = useRef(null)
  const tableWrapperRef = useRef(null)
  const pageRef = useRef(null)
  const toolbarRef = useRef(null)

  const [bgImage, setBgImage] = useState(() => localStorage.getItem(BG_STORAGE_KEY) || null)

  useEffect(() => {
    if (bgImage) {
      localStorage.setItem(BG_STORAGE_KEY, bgImage)
    } else {
      localStorage.removeItem(BG_STORAGE_KEY)
    }
  }, [bgImage])

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setBgImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveBg = () => setBgImage(null)

  const [{ headers, rows, widths, colHidden, showNumbers, showImages }, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.headers) && parsed.headers.length > 0) {
          const cols = parsed.headers.length
          const headers = parsed.headers.map((h) => (typeof h === 'string' ? h : ''))
          const widths = Array.from({ length: cols }, (_, i) => {
            const w = parsed.widths?.[i]
            return typeof w === 'number' && w >= MIN_COL_WIDTH ? w : DEFAULT_COL_WIDTH
          })
          const colHidden = Array.from({ length: cols }, (_, i) =>
            Boolean(parsed.colHidden?.[i])
          )
          const rawRows = Array.isArray(parsed.rows) ? parsed.rows : []
          const rows = rawRows.map((row) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = row?.[c]
              if (cell && typeof cell === 'object') {
                return { text: cell.text ?? '', image: cell.image ?? null }
              }
              if (typeof cell === 'string') return { text: cell, image: null }
              return makeEmptyCell()
            })
          )
          if (rows.length) {
            return {
              headers,
              rows,
              widths,
              colHidden,
              showNumbers: parsed.showNumbers !== false,
              showImages: parsed.showImages !== false,
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      headers: [...DEFAULT_HEADERS],
      rows: Array.from({ length: 12 }, () => makeEmptyRow(DEFAULT_HEADERS.length)),
      widths: [...DEFAULT_WIDTHS],
      colHidden: Array.from({ length: DEFAULT_HEADERS.length }, () => false),
      showNumbers: true,
      showImages: true,
    }
  })

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ headers, rows, widths, colHidden, showNumbers, showImages })
    )
  }, [headers, rows, widths, colHidden, showNumbers, showImages])

  // Re-translate default headers when language changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      headers: prev.headers.map(h =>
        GAMES_HEADER_DEFAULTS[h] ? t(GAMES_HEADER_DEFAULTS[h]) : h
      ),
    }))
  }, [lang])

  const toggleNumbers = () => setState((prev) => ({ ...prev, showNumbers: !prev.showNumbers }))
  const toggleImages = () => setState((prev) => ({ ...prev, showImages: !prev.showImages }))

  const hideColumn = (colIdx) => {
    setState((prev) => {
      const nextHidden = [...prev.colHidden]
      nextHidden[colIdx] = true
      return { ...prev, colHidden: nextHidden }
    })
  }

  const showAllColumns = () => {
    setState((prev) => ({
      ...prev,
      colHidden: prev.colHidden.map(() => false),
    }))
  }

  const hasHiddenColumns = colHidden.some(Boolean)

  const startResize = (colIdx, e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = widths[colIdx]

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      const nextWidth = Math.max(MIN_COL_WIDTH, startWidth + delta)
      setState((prev) => {
        const nextWidths = [...prev.widths]
        nextWidths[colIdx] = nextWidth
        return { ...prev, widths: nextWidths }
      })
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleHeaderChange = (colIdx, value) => {
    setState((prev) => {
      const nextHeaders = [...prev.headers]
      nextHeaders[colIdx] = value
      return { ...prev, headers: nextHeaders }
    })
  }

  const handleCellTextChange = (rowIdx, colIdx, value) => {
    setState((prev) => {
      const nextRows = prev.rows.map((row) => row.map((cell) => ({ ...cell })))
      nextRows[rowIdx][colIdx].text = value
      return { ...prev, rows: nextRows }
    })
  }

  const handleOpenImagePicker = (rowIdx, colIdx) => {
    pendingCellRef.current = { rowIdx, colIdx }
    fileInputRef.current?.click()
  }

  const handleImageSelected = async (e) => {
    const file = e.target.files?.[0]
    const target = pendingCellRef.current
    e.target.value = ''
    pendingCellRef.current = null
    if (!file || !target) return
    const dataUrl = await fileToDataUrl(file)
    setState((prev) => {
      const nextRows = prev.rows.map((row) => row.map((cell) => ({ ...cell })))
      nextRows[target.rowIdx][target.colIdx].image = dataUrl
      return { ...prev, rows: nextRows }
    })
  }

  const handleRemoveImage = (rowIdx, colIdx) => {
    setState((prev) => {
      const nextRows = prev.rows.map((row) => row.map((cell) => ({ ...cell })))
      nextRows[rowIdx][colIdx].image = null
      return { ...prev, rows: nextRows }
    })
  }

  const handleAddRow = () => {
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, makeEmptyRow(prev.headers.length)],
    }))
  }

  const handleRemoveLastRow = () => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.slice(0, -1) : prev.rows,
    }))
  }

  const handleAddColumn = () => {
    setState((prev) => ({
      ...prev,
      headers: [...prev.headers, t('games.column', { num: prev.headers.length + 1 })],
      widths: [...prev.widths, DEFAULT_COL_WIDTH],
      colHidden: [...prev.colHidden, false],
      rows: prev.rows.map((row) => [...row, makeEmptyCell()]),
    }))
  }

  const handleRemoveLastColumn = () => {
    setState((prev) => {
      if (prev.headers.length <= 1) return prev
      return {
        ...prev,
        headers: prev.headers.slice(0, -1),
        widths: prev.widths.slice(0, -1),
        colHidden: prev.colHidden.slice(0, -1),
        rows: prev.rows.map((row) => row.slice(0, -1)),
      }
    })
  }

  const handleClear = () => {
    setState({
      headers: [...DEFAULT_HEADERS],
      rows: Array.from({ length: 12 }, () => makeEmptyRow(DEFAULT_HEADERS.length)),
      widths: [...DEFAULT_WIDTHS],
      colHidden: Array.from({ length: DEFAULT_HEADERS.length }, () => false),
      showNumbers: true,
      showImages: true,
    })
  }

  const handleSnapshot = async () => {
    const page = pageRef.current
    const toolbar = toolbarRef.current
    const wrapper = tableWrapperRef.current
    if (!page || !wrapper) return

    // Hide toolbar
    toolbar.style.display = 'none'

    // Copy page background image onto the wrapper so it appears in the snapshot
    const pageBgImage = page.style.backgroundImage
    if (pageBgImage) {
      wrapper.style.backgroundImage = pageBgImage
      wrapper.style.backgroundSize = '100% 100%'
      wrapper.style.backgroundRepeat = 'no-repeat'
    } else {
      wrapper.style.backgroundColor = '#1a1a2e'
    }

    // Remove backdrop-filter (not supported by html2canvas)
    wrapper.style.backdropFilter = 'none'

    // Expand overflow so full table width is captured
    wrapper.style.overflowX = 'visible'
    wrapper.style.borderRadius = '0'

    await new Promise(r => setTimeout(r, 80))

    const canvas = await html2canvas(wrapper, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#1a1a2e',
      scale: 2,
      x: 0,
      y: 0,
      width: wrapper.scrollWidth,
      height: wrapper.scrollHeight,
    })

    // Restore everything
    toolbar.style.display = ''
    wrapper.style.backgroundImage = ''
    wrapper.style.backgroundSize = ''
    wrapper.style.backgroundRepeat = ''
    wrapper.style.backgroundColor = ''
    wrapper.style.backdropFilter = ''
    wrapper.style.overflowX = ''
    wrapper.style.borderRadius = ''

    const link = document.createElement('a')
    link.download = 'games-table.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handlePrint = () => {
    const PRINT_TARGET_WIDTH = 1040
    const scale = totalWidth > PRINT_TARGET_WIDTH ? PRINT_TARGET_WIDTH / totalWidth : 1
    document.documentElement.style.setProperty('--print-scale', String(scale))
    window.print()
  }

  const totalWidth = widths.reduce((acc, w, i) => (colHidden[i] ? acc : acc + w), 0)

  return (
    <div
      className="games-page"
      ref={pageRef}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="games-header no-print" ref={toolbarRef}>
        <button className="back-btn" onClick={() => navigate('/')}>
          {t('games.backToMain')}
        </button>
        <button className="add-row-btn" onClick={handleAddRow}>
          {t('games.addRow')}
        </button>
        <button className="remove-row-tb-btn" onClick={handleRemoveLastRow}>
          {t('games.removeRow')}
        </button>
        <button className="add-col-btn" onClick={handleAddColumn}>
          {t('games.addColumn')}
        </button>
        <button className="remove-col-btn" onClick={handleRemoveLastColumn}>
          {t('games.removeColumn')}
        </button>
        <button className="toggle-btn" onClick={toggleNumbers}>
          {showNumbers ? t('games.hideNumbers') : t('games.showNumbers')}
        </button>
        <button className="toggle-btn" onClick={toggleImages}>
          {showImages ? t('games.hideImages') : t('games.showImages')}
        </button>
        {hasHiddenColumns && (
          <button className="toggle-btn" onClick={showAllColumns}>
            {t('games.showHiddenColumns')}
          </button>
        )}
        <button className="print-btn" onClick={handlePrint}>
          {t('games.print')}
        </button>
        <button className="snapshot-btn" onClick={handleSnapshot}>
          {t('games.snapshot')}
        </button>
        <button className="clear-btn" onClick={handleClear}>
          {t('games.clearTable')}
        </button>
        <button className="bg-upload-btn" onClick={() => bgInputRef.current?.click()}>
          {bgImage ? t('games.changeBg') : t('games.uploadBg')}
        </button>
        {bgImage && (
          <button className="remove-bg-btn" onClick={handleRemoveBg}>{t('games.removeBg')}</button>
        )}
      </div>

      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleBgUpload}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageSelected}
      />

      <div className="games-table-wrapper" ref={tableWrapperRef}>
        <h1 className="games-title">{t('games.title')}</h1>
        <table
          className="games-table"
          style={{ width: `${totalWidth + (showNumbers ? 50 : 0)}px` }}
        >
          <colgroup>
            {showNumbers && <col style={{ width: '50px' }} />}
            {widths.map((w, colIdx) =>
              colHidden[colIdx] ? null : <col key={colIdx} style={{ width: `${w}px` }} />
            )}
          </colgroup>
          <thead>
            <tr>
              {showNumbers && <th className="number-col">#</th>}
              {headers.map((header, colIdx) =>
                colHidden[colIdx] ? null : (
                  <th key={colIdx}>
                    <div className="header-cell">
                      <input
                        className="header-input"
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                        placeholder={`Column ${colIdx + 1}`}
                      />
                      <button
                        className="col-hide-btn no-print"
                        onClick={() => hideColumn(colIdx)}
                        aria-label="Hide column"
                        title="Hide this column"
                      >
                        ×
                      </button>
                      <span
                        className="col-resize-handle no-print"
                        onMouseDown={(e) => startResize(colIdx, e)}
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {showNumbers && <td className="number-col">{rowIdx + 1}</td>}
                {row.map((cell, colIdx) =>
                  colHidden[colIdx] ? null : (
                  <td key={colIdx}>
                    <div className="cell-content">
                      {colIdx === 0 && showImages && (
                        cell.image ? (
                          <div className="cell-image-wrap">
                            <img src={cell.image} alt="" className="cell-image" />
                            <button
                              className="cell-image-remove no-print"
                              onClick={() => handleRemoveImage(rowIdx, colIdx)}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            className="cell-image-add no-print"
                            onClick={() => handleOpenImagePicker(rowIdx, colIdx)}
                            aria-label="Upload image"
                            title="Upload image"
                          >
                            +
                          </button>
                        )
                      )}
                      <input
                        type="text"
                        value={cell.text}
                        onChange={(e) => handleCellTextChange(rowIdx, colIdx, e.target.value)}
                        placeholder={headers[colIdx]}
                      />
                    </div>
                  </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default GamesPage
