import { useState } from 'react'
import { CATEGORIES, getCategoryConfig } from '../utils/categories.js'

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDateLong(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function RecordDetail({ record, onDelete }) {
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cfg = getCategoryConfig(record.category)

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(record.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const buildEmailBody = () => [
    `Category: ${cfg.label}${record.subcategory ? ' › ' + record.subcategory : ''}`,
    `Date/Time: ${fmtDateLong(record.timestamp)}`,
    record.location
      ? `Location: ${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)} (±${Math.round(record.location.accuracy)}m)`
      : 'Location: Not captured',
    '',
    record.notes ? `Notes:\n${record.notes}` : null,
    '',
    `Photos: ${record.photos?.length || 0}`,
    `Record ID: ${record.id}`,
  ].filter(l => l !== null).join('\n')

  const emailHref = [
    'mailto:', cfg.recipient,
    '?subject=', encodeURIComponent(`Field Report: ${cfg.label}${record.subcategory ? ' – ' + record.subcategory : ''}`),
    '&body=', encodeURIComponent(buildEmailBody()),
  ].join('')

  const handleShare = async () => {
    const text = [
      `${cfg.icon} Field Report: ${cfg.label}${record.subcategory ? ' › ' + record.subcategory : ''}`,
      `🕐 ${fmtDateLong(record.timestamp)}`,
      record.location ? `📍 ${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)}` : '',
      record.notes ? `📝 ${record.notes}` : '',
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      try { await navigator.share({ title: `Field Report: ${cfg.label}`, text }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        alert('Report copied to clipboard')
      } catch {
        alert('Share not supported on this browser')
      }
    }
  }

  return (
    <div className="record-detail">
      <div className="detail-field">
        <span className="detail-label">Date/Time</span>
        <span className="detail-value">{fmtDateLong(record.timestamp)}</span>
      </div>

      <div className="detail-field">
        <span className="detail-label">Sync</span>
        <span className="detail-value" style={{ color: record.synced ? '#2e7d32' : '#e65100' }}>
          {record.synced ? '✓ Synced to server' : '⏳ Not yet synced'}
        </span>
      </div>

      {record.location && (
        <div className="detail-field">
          <span className="detail-label">Location</span>
          <span className="detail-value">
            <div className="gps-coords">{record.location.lat.toFixed(6)}, {record.location.lng.toFixed(6)}</div>
            <div style={{ fontSize: '0.72rem', color: '#666', margin: '2px 0 4px' }}>
              Accuracy ±{Math.round(record.location.accuracy)}m
              {record.location.altitude != null ? ` · Altitude ${Math.round(record.location.altitude)}m` : ''}
            </div>
            <a
              href={`https://maps.google.com/?q=${record.location.lat},${record.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: '#1565c0' }}
            >
              Open in Maps ↗
            </a>
          </span>
        </div>
      )}

      {record.notes && (
        <div className="detail-field">
          <span className="detail-label">Notes</span>
          <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{record.notes}</span>
        </div>
      )}

      {record.photos?.length > 0 && (
        <div>
          <div className="detail-field">
            <span className="detail-label">Photos</span>
            <span className="detail-value">{record.photos.length} photo{record.photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="detail-photos">
            {record.photos.map((src, i) => (
              <img key={i} src={src} alt={`Photo ${i + 1}`} className="detail-photo" onClick={() => setLightboxSrc(src)} />
            ))}
          </div>
        </div>
      )}

      <div className="detail-actions">
        <a href={emailHref} className="btn btn-secondary btn-sm">✉️ Email report</a>
        <button className="btn btn-secondary btn-sm" onClick={handleShare}>🔗 Share</button>
        <button className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-outline'}`} onClick={handleDelete}>
          {confirmDelete ? '⚠️ Confirm delete' : '🗑️ Delete'}
        </button>
      </div>

      <div style={{ fontSize: '0.68rem', color: '#aaa', marginTop: 8 }}>ID: {record.id}</div>

      {lightboxSrc && (
        <div className="lightbox" onClick={() => setLightboxSrc(null)}>
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)}>×</button>
          <img src={lightboxSrc} alt="Full size" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default function RecordsList({ records, onDelete }) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = records.filter(r => {
    if (filterCat !== 'all' && r.category !== filterCat) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.notes || '').toLowerCase().includes(q) ||
      (r.category || '').toLowerCase().includes(q) ||
      (r.subcategory || '').toLowerCase().includes(q)
    )
  })

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id)

  return (
    <div>
      <div className="search-bar">
        <span style={{ color: '#888' }}>🔍</span>
        <input
          placeholder="Search notes, category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.2rem', lineHeight: 1, padding: 0 }}
          >×</button>
        )}
      </div>

      <div className="filter-bar">
        <button
          className={`filter-chip ${filterCat === 'all' ? 'active' : ''}`}
          style={filterCat === 'all' ? { background: '#01579b' } : {}}
          onClick={() => setFilterCat('all')}
        >
          All ({records.length})
        </button>
        {Object.entries(CATEGORIES).map(([key, cfg]) => {
          const count = records.filter(r => r.category === key).length
          if (!count) return null
          return (
            <button
              key={key}
              className={`filter-chip ${filterCat === key ? 'active' : ''}`}
              style={filterCat === key ? { background: cfg.color } : {}}
              onClick={() => setFilterCat(key)}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            {records.length === 0 ? 'No sightings yet' : 'No matches found'}
          </span>
          <span style={{ fontSize: '0.82rem' }}>
            {records.length === 0 ? 'Tap Log to record your first sighting.' : 'Try a different search or filter.'}
          </span>
        </div>
      ) : (
        <div className="records-list">
          {filtered.map(record => {
            const cfg = getCategoryConfig(record.category)
            const isExpanded = expandedId === record.id
            return (
              <div key={record.id} className="record-card">
                <div className="record-card-header" onClick={() => toggle(record.id)}>
                  <div
                    className="record-cat-badge"
                    style={{ background: cfg.color + '22', border: `1.5px solid ${cfg.color}55` }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="record-card-info">
                    <div className="record-card-title">
                      {cfg.label}{record.subcategory ? ` · ${record.subcategory}` : ''}
                    </div>
                    <div className="record-card-sub">{fmtDate(record.timestamp)}</div>
                  </div>
                  <div className="record-card-meta">
                    {record.location && <span title="Has location">📍</span>}
                    {record.photos?.length > 0 && <span title="Has photos">📷{record.photos.length}</span>}
                    <span
                      className="sync-dot"
                      style={{ background: record.synced ? '#43a047' : '#ef6c00' }}
                      title={record.synced ? 'Synced' : 'Not synced'}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#bbb' }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {!isExpanded && record.notes && (
                  <div className="record-card-notes">{record.notes}</div>
                )}

                {isExpanded && <RecordDetail record={record} onDelete={onDelete} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
