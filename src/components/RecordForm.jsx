import { useState, useRef } from 'react'
import { useGeolocation } from '../hooks/useGeolocation.js'
import { useRecords } from '../context/RecordsContext.jsx'
import { CATEGORIES } from '../utils/categories.js'
import { compressPhoto } from '../utils/photos.js'
import CategoryPicker from './CategoryPicker.jsx'

export default function RecordForm({ onSave }) {
  const { addRecord } = useRecords()
  const { location, error: gpsError, loading: gpsLoading, getLocation } = useGeolocation()

  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const photoRef = useRef()

  const handleCategoryChange = (cat, sub) => {
    setCategory(cat)
    setSubcategory(sub)
  }

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const compressed = await compressPhoto(file)
      setPhotos(prev => [...prev, compressed])
    }
    e.target.value = ''
  }

  const triggerCamera = () => {
    photoRef.current.setAttribute('capture', 'environment')
    photoRef.current.click()
  }

  const triggerGallery = () => {
    photoRef.current.removeAttribute('capture')
    photoRef.current.click()
  }

  const handleSave = () => {
    if (!category || saving) return
    setSaving(true)
    addRecord({
      category,
      subcategory,
      notes: notes.trim(),
      photos,
      location,
    })
    setCategory('')
    setSubcategory('')
    setNotes('')
    setPhotos([])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSave()
  }

  const catColor = category ? CATEGORIES[category]?.color : undefined

  return (
    <div>
      {/* Category */}
      <div className="section-card">
        <div className="section-title">Bird Group *</div>
        <CategoryPicker
          category={category}
          subcategory={subcategory}
          onChange={handleCategoryChange}
        />
      </div>

      {/* Location */}
      <div className="section-card">
        <div className="section-title">Location</div>
        <div className={`gps-display ${location ? 'has-location' : ''}`}>
          <span style={{ fontSize: '1.3rem' }}>{location ? '📍' : '🔍'}</span>
          <div style={{ flex: 1 }}>
            {location ? (
              <>
                <div className="gps-coords">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
                <div style={{ fontSize: '0.72rem', marginTop: 2, color: '#555' }}>
                  Accuracy ±{Math.round(location.accuracy)}m
                  {location.altitude != null ? ` · Altitude ${Math.round(location.altitude)}m` : ''}
                </div>
              </>
            ) : gpsError ? (
              <span style={{ color: '#c62828', fontSize: '0.82rem' }}>{gpsError}</span>
            ) : (
              <span>No location captured yet</span>
            )}
          </div>
        </div>
        <button
          className="btn btn-secondary btn-full"
          onClick={getLocation}
          disabled={gpsLoading}
        >
          {gpsLoading
            ? <><span className="spinner dark" />&nbsp;Locating…</>
            : location ? '🔄 Update GPS Location' : '📍 Capture GPS Location'}
        </button>
      </div>

      {/* Photos */}
      <div className="section-card">
        <div className="section-title">
          Photos {photos.length > 0 && `(${photos.length})`}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={triggerCamera}>
            📷 Camera
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={triggerGallery}>
            🖼️ Gallery
          </button>
        </div>
        {photos.length > 0 && (
          <div className="photo-thumbs">
            {photos.map((src, i) => (
              <div key={i} className="photo-thumb">
                <img src={src} alt={`Photo ${i + 1}`} />
                <button
                  className="remove-photo"
                  onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="section-card">
        <div className="section-title">Notes</div>
        <textarea
          className="notes-input"
          placeholder="Describe the sighting — behaviour, habitat, number of birds, age/plumage details, call…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Save */}
      <div style={{ padding: '4px 12px 20px' }}>
        {saved ? (
          <div className="sync-result success" style={{ textAlign: 'center', fontWeight: 600 }}>
            🐦 Sighting logged!
          </div>
        ) : (
          <button
            className="btn btn-primary btn-full"
            onClick={handleSave}
            disabled={!category || saving}
            style={{
              fontSize: '1rem',
              padding: '14px',
              background: catColor || undefined,
            }}
          >
            {saving ? <><span className="spinner" />&nbsp;Saving…</> : '🐦 Log Sighting'}
          </button>
        )}
        {!category && (
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginTop: 6 }}>
            Select a bird group above to log
          </p>
        )}
      </div>
    </div>
  )
}
