import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SchedulePage.css'

const DEFAULT_HEADERS = ['Date', 'Team 1', 'Time', 'Team 2']
const DEFAULT_WIDTHS = [130, 220, 110, 220]
const DEFAULT_COL_WIDTH = 150
const MIN_COL_WIDTH = 50
const STORAGE_KEY = 'footballScheduleTable'
const BG_STORAGE_KEY = 'footballScheduleBg'

const makeEmptyRow = (cols) => Array.from({ length: cols }, () => '')

function SchedulePage() {
  const navigate = useNavigate()
  const bgInputRef = useRef(null)

  const [bgImage, setBgImage] = useState(() => localStorage.getItem(BG_STORAGE_KEY) || null)

  const [{ headers, rows, widths, colHidden, showNumbers, title }, setState] = useState(() => {
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
          const colHidden = Array.from({ length: cols }, (_, i) => Boolean(parsed.colHidden?.[i]))
          const rawRows = Array.isArray(parsed.rows) ? parsed.rows : []
          const rows = rawRows.map((row) =>
            Array.from({ length: cols }, (_, c) =>
              typeof row?.[c] === 'string' ? row[c] : ''
            )
          )
          if (rows.length) {
            return {
              headers,
              rows,
              widths,
              colHidden,
              showNumbers: parsed.showNumbers !== false,
              title: parsed.title || 'Game Schedule',
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      headers: [...DEFAULT_HEADERS],
      rows: Array.from({ length: 10 }, () => makeEmptyRow(DEFAULT_HEADERS.length)),
      widths: [...DEFAULT_WIDTHS],
      colHidden: Array.from({ length: DEFAULT_HEADERS.length }, () => false),
      showNumbers: true,
      title: 'Game Schedule',
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ headers, rows, widths, colHidden, showNumbers, title }))
  }, [headers, rows, widths, colHidden, showNumbers, title])

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

  const toggleNumbers = () => setState((prev) => ({ ...prev, showNumbers: !prev.showNumbers }))

  const hideColumn = (colIdx) => {
    setState((prev) => {
      const nextHidden = [...prev.colHidden]
      nextHidden[colIdx] = true
      return { ...prev, colHidden: nextHidden }
    })
  }

  const showAllColumns = () => {
    setState((prev) => ({ ...prev, colHidden: prev.colHidden.map(() => false) }))
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

  const handleCellChange = (rowIdx, colIdx, value) => {
    setState((prev) => {
      const nextRows = prev.rows.map((row) => [...row])
      nextRows[rowIdx][colIdx] = value
      return { ...prev, rows: nextRows }
    })
  }

  const handleTitleChange = (e) => {
    setState((prev) => ({ ...prev, title: e.target.value }))
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
      headers: [...prev.headers, `Column ${prev.headers.length + 1}`],
      widths: [...prev.widths, DEFAULT_COL_WIDTH],
      colHidden: [...prev.colHidden, false],
      rows: prev.rows.map((row) => [...row, '']),
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
      rows: Array.from({ length: 10 }, () => makeEmptyRow(DEFAULT_HEADERS.length)),
      widths: [...DEFAULT_WIDTHS],
      colHidden: Array.from({ length: DEFAULT_HEADERS.length }, () => false),
      showNumbers: true,
      title: 'Game Schedule',
    })
  }

  const handlePrint = () => {
    const PRINT_TARGET_WIDTH = 1040
    const scale = totalWidth > PRINT_TARGET_WIDTH ? PRINT_TARGET_WIDTH / totalWidth : 1
    document.documentElement.style.setProperty('--sched-print-scale', String(scale))
    window.print()
  }

  const totalWidth = widths.reduce((acc, w, i) => (colHidden[i] ? acc : acc + w), 0)

  return (
    <div
      className="schedule-page"
      style={bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      <div className="schedule-toolbar no-print">
        <button className="sched-btn back" onClick={() => navigate('/')}>Back</button>
        <button className="sched-btn add-row" onClick={handleAddRow}>+ Row</button>
        <button className="sched-btn rem-row" onClick={handleRemoveLastRow}>− Row</button>
        <button className="sched-btn add-col" onClick={handleAddColumn}>+ Column</button>
        <button className="sched-btn rem-col" onClick={handleRemoveLastColumn}>− Column</button>
        <button className="sched-btn toggle" onClick={toggleNumbers}>
          {showNumbers ? 'Hide #' : 'Show #'}
        </button>
        {hasHiddenColumns && (
          <button className="sched-btn toggle" onClick={showAllColumns}>Show Hidden Cols</button>
        )}
        <button className="sched-btn print" onClick={handlePrint}>Print / PDF</button>
        <button className="sched-btn bg-upload" onClick={() => bgInputRef.current?.click()}>
          {bgImage ? 'Change BG' : 'Upload BG'}
        </button>
        {bgImage && (
          <button className="sched-btn rem-bg" onClick={handleRemoveBg}>Remove BG</button>
        )}
        <button className="sched-btn clear" onClick={handleClear}>Clear</button>
      </div>

      <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgUpload} />

      <div className="schedule-table-wrapper">
        <input
          className="schedule-title-input no-print"
          value={title}
          onChange={handleTitleChange}
          placeholder="Schedule Title"
        />
        <h1 className="schedule-title print-only">{title}</h1>

        <table
          className="schedule-table"
          style={{ width: `${totalWidth + (showNumbers ? 50 : 0)}px` }}
        >
          <colgroup>
            {showNumbers && <col style={{ width: '50px' }} />}
            {widths.map((w, i) =>
              colHidden[i] ? null : <col key={i} style={{ width: `${w}px` }} />
            )}
          </colgroup>
          <thead>
            <tr>
              {showNumbers && <th className="num-col">#</th>}
              {headers.map((header, colIdx) =>
                colHidden[colIdx] ? null : (
                  <th key={colIdx}>
                    <div className="sched-header-cell">
                      <input
                        className="sched-header-input"
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                        placeholder={`Col ${colIdx + 1}`}
                      />
                      <button
                        className="sched-col-hide no-print"
                        onClick={() => hideColumn(colIdx)}
                        title="Hide column"
                      >×</button>
                      <span
                        className="sched-resize-handle no-print"
                        onMouseDown={(e) => startResize(colIdx, e)}
                        title="Drag to resize"
                      />
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'row-even' : 'row-odd'}>
                {showNumbers && <td className="num-col">{rowIdx + 1}</td>}
                {row.map((cell, colIdx) =>
                  colHidden[colIdx] ? null : (
                    <td key={colIdx}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                        placeholder=""
                      />
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

export default SchedulePage
