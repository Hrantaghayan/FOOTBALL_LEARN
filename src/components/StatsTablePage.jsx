import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import html2canvas from 'html2canvas'
import { useLanguage } from '../context/LanguageContext'
import './SchedulePage.css'

const DEFAULT_COL_WIDTH = 150
const MIN_COL_WIDTH = 50

const makeEmptyCell = () => ({ text: '', image: null })
const makeEmptyRow = (cols) => Array.from({ length: cols }, makeEmptyCell)

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

function StatsTablePage({
  storageKey,
  bgStorageKey,
  defaultHeaderKeys,
  defaultWidths,
  imageColIndices,
  titleKey,
  downloadName,
}) {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const bgInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const pendingCellRef = useRef(null)
  const tableWrapperRef = useRef(null)
  const pageRef = useRef(null)
  const toolbarRef = useRef(null)
  const IMAGE_COL_INDICES = useRef(new Set(imageColIndices || [])).current

  const [bgImage, setBgImage] = useState(() => localStorage.getItem(bgStorageKey) || null)

  const [{ headers, rows, widths, colHidden, showNumbers, showImages, title }, setState] = useState(() => {
    const initialHeaders = defaultHeaderKeys.map((key) => t(key))
    const initialTitle = t(titleKey)
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.headers) && parsed.headers.length > 0) {
          const cols = parsed.headers.length
          const parsedHeaders = parsed.headers.map((h) => (typeof h === 'string' ? h : ''))
          const savedWidths = Array.from({ length: cols }, (_, i) => {
            const w = parsed.widths?.[i]
            return typeof w === 'number' && w >= MIN_COL_WIDTH ? w : DEFAULT_COL_WIDTH
          })
          const savedColHidden = Array.from({ length: cols }, (_, i) => Boolean(parsed.colHidden?.[i]))
          const rawRows = Array.isArray(parsed.rows) ? parsed.rows : []
          const savedRows = rawRows.map((row) =>
            Array.from({ length: cols }, (_, c) => {
              const cell = row?.[c]
              if (cell && typeof cell === 'object') {
                return { text: cell.text ?? '', image: cell.image ?? null }
              }
              if (typeof cell === 'string') return { text: cell, image: null }
              return makeEmptyCell()
            })
          )
          if (savedRows.length) {
            return {
              headers: parsedHeaders,
              rows: savedRows,
              widths: savedWidths,
              colHidden: savedColHidden,
              showNumbers: parsed.showNumbers !== false,
              showImages: parsed.showImages !== false,
              title: parsed.title || initialTitle,
            }
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      headers: initialHeaders,
      rows: Array.from({ length: 10 }, () => makeEmptyRow(initialHeaders.length)),
      widths: [...defaultWidths],
      colHidden: Array.from({ length: initialHeaders.length }, () => false),
      showNumbers: true,
      showImages: true,
      title: initialTitle,
    }
  })

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ headers, rows, widths, colHidden, showNumbers, showImages, title })
    )
  }, [storageKey, headers, rows, widths, colHidden, showNumbers, showImages, title])

  useEffect(() => {
    if (bgImage) localStorage.setItem(bgStorageKey, bgImage)
    else localStorage.removeItem(bgStorageKey)
  }, [bgStorageKey, bgImage])

  useEffect(() => {
    // No automatic header/title retranslation on language change — users can edit manually.
    // This effect is kept so `lang` is read (and future retranslation can hook here).
    void lang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

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
  const toggleImages = () => setState((prev) => ({ ...prev, showImages: !prev.showImages }))

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
    const pointerId = e.pointerId
    const target = e.currentTarget
    try {
      target.setPointerCapture?.(pointerId)
    } catch {
      /* ignore */
    }

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
      target.removeEventListener('pointermove', onMove)
      target.removeEventListener('pointerup', onUp)
      target.removeEventListener('pointercancel', onUp)
      try {
        target.releasePointerCapture?.(pointerId)
      } catch {
        /* ignore */
      }
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    target.addEventListener('pointermove', onMove)
    target.addEventListener('pointerup', onUp)
    target.addEventListener('pointercancel', onUp)
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
      headers: [...prev.headers, t('stats.column', { num: prev.headers.length + 1 })],
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
      headers: defaultHeaderKeys.map((k) => t(k)),
      rows: Array.from({ length: 10 }, () => makeEmptyRow(defaultHeaderKeys.length)),
      widths: [...defaultWidths],
      colHidden: Array.from({ length: defaultHeaderKeys.length }, () => false),
      showNumbers: true,
      showImages: true,
      title: t(titleKey),
    })
  }

  const handleSnapshot = async () => {
    const page = pageRef.current
    const toolbar = toolbarRef.current
    const wrapper = tableWrapperRef.current
    if (!page || !wrapper) return

    toolbar.style.display = 'none'

    const pageBgImage = page.style.backgroundImage
    if (pageBgImage) {
      wrapper.style.backgroundImage = pageBgImage
      wrapper.style.backgroundSize = '100% 100%'
      wrapper.style.backgroundRepeat = 'no-repeat'
    } else {
      wrapper.style.backgroundColor = '#1a1a2e'
    }

    wrapper.style.backdropFilter = 'none'
    wrapper.style.overflowX = 'visible'
    wrapper.style.borderRadius = '0'

    await new Promise((r) => setTimeout(r, 80))

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

    toolbar.style.display = ''
    wrapper.style.backgroundImage = ''
    wrapper.style.backgroundSize = ''
    wrapper.style.backgroundRepeat = ''
    wrapper.style.backgroundColor = ''
    wrapper.style.backdropFilter = ''
    wrapper.style.overflowX = ''
    wrapper.style.borderRadius = ''

    const link = document.createElement('a')
    link.download = downloadName
    link.href = canvas.toDataURL('image/png')
    link.click()
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
      ref={pageRef}
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <div className="schedule-toolbar no-print" ref={toolbarRef}>
        <button className="sched-btn back" onClick={() => navigate('/')}>
          {t('stats.back')}
        </button>
        <button className="sched-btn add-row" onClick={handleAddRow}>
          {t('stats.addRow')}
        </button>
        <button className="sched-btn rem-row" onClick={handleRemoveLastRow}>
          {t('stats.removeRow')}
        </button>
        <button className="sched-btn add-col" onClick={handleAddColumn}>
          {t('stats.addColumn')}
        </button>
        <button className="sched-btn rem-col" onClick={handleRemoveLastColumn}>
          {t('stats.removeColumn')}
        </button>
        <button className="sched-btn toggle" onClick={toggleNumbers}>
          {showNumbers ? t('stats.hideNumbers') : t('stats.showNumbers')}
        </button>
        <button className="sched-btn toggle" onClick={toggleImages}>
          {showImages ? t('stats.hideImages') : t('stats.showImages')}
        </button>
        {hasHiddenColumns && (
          <button className="sched-btn toggle" onClick={showAllColumns}>
            {t('stats.showHiddenCols')}
          </button>
        )}
        <button className="sched-btn print" onClick={handlePrint}>
          {t('stats.print')}
        </button>
        <button className="sched-btn snapshot" onClick={handleSnapshot}>
          {t('stats.snapshot')}
        </button>
        <button className="sched-btn bg-upload" onClick={() => bgInputRef.current?.click()}>
          {bgImage ? t('stats.changeBg') : t('stats.uploadBg')}
        </button>
        {bgImage && (
          <button className="sched-btn rem-bg" onClick={handleRemoveBg}>
            {t('stats.removeBg')}
          </button>
        )}
        <button className="sched-btn clear" onClick={handleClear}>
          {t('stats.clear')}
        </button>
      </div>

      <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgUpload} />
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelected} />

      <div className="schedule-table-wrapper" ref={tableWrapperRef}>
        <input
          className="schedule-title-input no-print"
          value={title}
          onChange={handleTitleChange}
          placeholder={t(titleKey)}
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
                      >
                        ×
                      </button>
                      <span
                        className="sched-resize-handle no-print"
                        onPointerDown={(e) => startResize(colIdx, e)}
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
                      <div className="sched-cell-content">
                        {IMAGE_COL_INDICES.has(colIdx) && showImages && (
                          cell.image ? (
                            <div className="sched-cell-image-wrap">
                              <img src={cell.image} alt="" className="sched-cell-image" />
                              <button
                                className="sched-cell-image-remove no-print"
                                onClick={() => handleRemoveImage(rowIdx, colIdx)}
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <button
                              className="sched-cell-image-add no-print"
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
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          placeholder=""
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

export default StatsTablePage
