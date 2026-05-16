import { useState, useRef, useEffect } from 'react'
import { CATEGORIES } from '../utils/categories.js'

const compress = (file) => new Promise(resolve => {
  const reader = new FileReader()
  reader.onload = ({ target: { result } }) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 1200
      let { width: w, height: h } = img
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else       { w = Math.round(w * MAX / h); h = MAX }
      }
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(c.toDataURL('image/jpeg', 0.75))
    }
    img.src = result
  }
  reader.readAsDataURL(file)
})

export default function RecordForm({ onSave }) {
  const [category, setCategory] = useState('')
  const [subcategory, setSub]   = useState('')
  const [notes, setNotes]       = useState('')
  const [photos, setPhotos]     = useState([])
  const [location, setLoc]      = useState(null)
  const [gpsLoading, setGpsLoad] = useState(false)
  const [gpsError, setGpsErr]   = useState(null)
  const [done, setDone]         = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const photoRef = useRef()
  const videoRef = useRef()

  useEffect(() => {
    if (cameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraOpen, cameraStream])

  const openCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      setCameraStream(stream)
      setCameraOpen(true)
    } catch {
      setCameraError('Camera not available — try Gallery instead')
    }
  }

  const snapPhoto = () => {
    const video = videoRef.current
    const MAX = 1200
    let w = video.videoWidth, h = video.videoHeight
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX }
      else       { w = Math.round(w * MAX / h); h = MAX }
    }
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    c.getContext('2d').drawImage(video, 0, 0, w, h)
    setPhotos(p => [...p, c.toDataURL('image/jpeg', 0.75)])
  }

  const closeCamera = () => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop())
    setCameraStream(null)
    setCameraOpen(false)
  }

  const captureGPS = () => {
    if (!navigator.geolocation) { setGpsErr('Geolocation not supported'); return }
    setGpsLoad(true); setGpsErr(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => { setLoc({ lat: c.latitude, lng: c.longitude, accuracy: c.accuracy }); setGpsLoad(false) },
      ({ message })   => { setGpsErr(message); setGpsLoad(false) },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const addPhotos = async (e) => {
    for (const f of Array.from(e.target.files || [])) {
      const compressed = await compress(f)
      setPhotos(p => [...p, compressed])
    }
    e.target.value = ''
  }

  const save = () => {
    onSave({ category, subcategory, notes: notes.trim(), photos, location })
    setCategory(''); setSub(''); setNotes(''); setPhotos([])
    setDone(true); setTimeout(() => setDone(false), 2000)
  }

  const cfg = CATEGORIES[category]

  return (
    <div>
      {/* Bird Group */}
      <div className="section-card">
        <div className="section-title">Bird Group *</div>
        <div className="cat-grid">
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <button key={key} className={`cat-btn ${category === key ? 'selected' : ''}`}
              style={category === key ? { background: c.color } : {}}
              onClick={() => { setCategory(key); setSub('') }}>
              <span className="cat-icon">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
        {cfg && (
          <div className="subcat-pills">
            {cfg.subcategories.map(s => (
              <button key={s} className={`subcat-pill ${subcategory === s ? 'selected' : ''}`}
                style={subcategory === s ? { background: cfg.color, borderColor: cfg.color } : {}}
                onClick={() => setSub(subcategory === s ? '' : s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="section-card">
        <div className="section-title">Location</div>
        <div className={`gps-display ${location ? 'has-location' : ''}`}>
          <span style={{ fontSize: '1.3rem' }}>{location ? '📍' : '🔍'}</span>
          <div style={{ flex: 1 }}>
            {location
              ? <><div className="gps-coords">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#555', marginTop: 2 }}>±{Math.round(location.accuracy)}m</div></>
              : gpsError
                ? <span style={{ color: '#c62828', fontSize: '0.82rem' }}>{gpsError}</span>
                : <span>No location captured yet</span>}
          </div>
        </div>
        <button className="btn btn-secondary btn-full" onClick={captureGPS} disabled={gpsLoading}>
          {gpsLoading ? <><span className="spinner dark" />&nbsp;Locating…</> : location ? '🔄 Update Location' : '📍 Capture GPS'}
        </button>
      </div>

      {/* Photos */}
      <div className="section-card">
        <div className="section-title">Photos {photos.length > 0 && `(${photos.length})`}</div>
        <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addPhotos} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={openCamera}>
            📷 Camera
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }}
            onClick={() => { photoRef.current.removeAttribute('capture'); photoRef.current.click() }}>
            🖼️ Gallery
          </button>
        </div>
        {cameraError && <p style={{ fontSize: '0.78rem', color: '#c62828', marginTop: 6 }}>{cameraError}</p>}
        {photos.length > 0 && (
          <div className="photo-thumbs">
            {photos.map((src, i) => (
              <div key={i} className="photo-thumb">
                <img src={src} alt="" />
                <button className="remove-photo" onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Camera modal */}
      {cameraOpen && (
        <div className="camera-modal" onClick={closeCamera}>
          <div className="camera-view" onClick={e => e.stopPropagation()}>
            <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={closeCamera}>✕ Close</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={snapPhoto}>📸 Snap</button>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="section-card">
        <div className="section-title">Notes</div>
        <textarea className="notes-input"
          placeholder="Describe the sighting — behaviour, habitat, count, age/plumage, call…"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {/* Save */}
      <div style={{ padding: '4px 12px 20px' }}>
        {done
          ? <div className="sync-result success" style={{ textAlign: 'center', fontWeight: 600 }}>🐦 Sighting logged!</div>
          : <button className="btn btn-primary btn-full" onClick={save} disabled={!category}
              style={{ fontSize: '1rem', padding: '14px', background: cfg?.color }}>
              🐦 Log Sighting
            </button>}
        {!category && <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: 6 }}>Select a bird group above to log</p>}
      </div>
    </div>
  )
}
