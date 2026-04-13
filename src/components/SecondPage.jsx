import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './SecondPage.css'

function SecondPage() {
  const navigate = useNavigate()
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [logos, setLogos] = useState(Array(24).fill(null))
  const bgInputRef = useRef(null)
  const logoInputRef = useRef(null)

  const removeWhiteBg = (file) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const w = img.width, h = img.height
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, w, h)
        const d = imageData.data
        const isWhite = (i) => d[i] > 220 && d[i + 1] > 220 && d[i + 2] > 220
        const idx = (x, y) => (y * w + x) * 4
        const visited = new Uint8Array(w * h)
        const queue = []
        // Seed flood-fill from all edge pixels that are white
        for (let x = 0; x < w; x++) {
          if (isWhite(idx(x, 0))) queue.push(x * h)             // top edge pixel key: x*h+y
          if (isWhite(idx(x, h - 1))) queue.push(x * h + h - 1)
        }
        for (let y = 0; y < h; y++) {
          if (isWhite(idx(0, y))) queue.push(y)                  // left edge
          if (isWhite(idx(w - 1, y))) queue.push((w - 1) * h + y) // right edge
        }
        // BFS flood-fill
        let head = 0
        while (head < queue.length) {
          const key = queue[head++]
          const x = Math.floor(key / h), y = key % h
          const pi = y * w + x
          if (x < 0 || x >= w || y < 0 || y >= h) continue
          if (visited[pi]) continue
          const i = pi * 4
          if (!isWhite(i)) continue
          visited[pi] = 1
          d[i + 3] = 0
          queue.push((x - 1) * h + y, (x + 1) * h + y, x * h + y - 1, x * h + y + 1)
        }
        ctx.putImageData(imageData, 0, 0)
        canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/png')
      }
      img.src = URL.createObjectURL(file)
    })

  const handleBgUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBackgroundImage(URL.createObjectURL(file))
  }

  const handleLogoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const processed = await Promise.all(files.map(removeWhiteBg))
    setLogos((prev) => {
      const next = [...prev]
      for (const url of processed) {
        const emptyIdx = next.findIndex((s) => s === null)
        if (emptyIdx === -1) break
        next[emptyIdx] = url
      }
      return next
    })
    e.target.value = ''
  }

  const handleRemove = (index) => {
    setLogos((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index])
      next[index] = null
      return next
    })
  }

  const renderSlot = (index) => (
    <div key={index} className="team-slot">
      {logos[index] ? (
        <>
          <img src={logos[index]} alt="" />
          <button className="remove-btn" onClick={() => handleRemove(index)}>×</button>
        </>
      ) : null}
    </div>
  )

  // Frame layout: logos around the center
  const top = [0, 1, 2, 3, 4, 5]
  const midLeft1 = [6, 7, 8]
  const midRight1 = [9, 10, 11]
  const midLeft2 = [12, 13, 14]
  const midRight2 = [15, 16, 17]
  const bottom = [18, 19, 20, 21, 22, 23]

  const uploadedCount = logos.filter(Boolean).length

  return (
    <div
      className="second-page"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className="second-page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          Back to Main
        </button>
        <button className="bg-upload-btn" onClick={() => bgInputRef.current?.click()}>
          Upload Background
        </button>
        <button
          className="logo-upload-btn"
          onClick={() => logoInputRef.current?.click()}
          disabled={uploadedCount >= 24}
        >
          Upload Team Logo ({uploadedCount}/24)
        </button>
        <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgUpload} />
        <input ref={logoInputRef} type="file" accept="image/*" multiple hidden onChange={handleLogoUpload} />
      </div>

      <div className="logo-frame">
        <div className="frame-row">
          {top.map(renderSlot)}
        </div>

        <div className="frame-middle">
          <div className="frame-side">
            <div className="frame-side-row">{midLeft1.map(renderSlot)}</div>
            <div className="frame-side-row">{midLeft2.map(renderSlot)}</div>
          </div>
          <div className="frame-center" />
          <div className="frame-side">
            <div className="frame-side-row">{midRight1.map(renderSlot)}</div>
            <div className="frame-side-row">{midRight2.map(renderSlot)}</div>
          </div>
        </div>

        <div className="frame-row">
          {bottom.map(renderSlot)}
        </div>
      </div>
    </div>
  )
}

export default SecondPage
