import { useState } from 'react'
import { useRecords } from '../context/RecordsContext.jsx'
import { getCategoryConfig } from '../utils/categories.js'

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function RecordDetail({ record }) {
  const { deleteRecord } = useRecords()
  const [lightboxSrc, setLightboxSrc] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cfg = getCategoryConfig(record.category)

  const handleDelete = () => {
    if (confirmDelete) {
      deleteRecord(record.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  const buildEmailBody = () => {
    const lines = [
      `Category: ${cfg.label}${record.subcategory ? ' › ' + record.subcategory : ''}`,
      `Date/Time: ${fmtDate(record.timestamp)}`,
      record.location
        ? `Location: ${record.location.lat.toFixed(6)}, ${record.location.lng.toFixed(6)} (±${Math.round(record.location.accuracy)}m)`
        : 'Location: Not captured',
      record.orientation
        ? `Bearing: ${record.orientation.heading}° ${record.orientation.directionLabel} | ${record.orientation.tiltLabel}`
        : null,
      '',
      record.notes ? `Notes:\n${record.notes}` : null,
      '',
      `Photos: ${record.photos?.length || 0}`,
      `Record ID: ${record.id}`,
    ].filter(l => l !== null).join('\n')
    return lines
  }

  const emailHref = [
    'mailto:', cfg.recipient,
    '?subject=', encodeURIComponent(`Field Report: ${cfg.label}${record.subcategory ? ' – ' + record.subcategory : ''}`),
    '&body=', encodeURIComponent(buildEmailBody()),
  ].join('')

  const handleShare = async () => {
    const text = [
      `${cfg.icon} Field Report: ${cfg.label}${record.subcategory ? ' › ' + record.subcategory : ''}`,
      `🕐 ${fmtDate(record.timestamp)}`,
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
        <span className="detail-value">{fmtDate(record.timestamp)}</span>
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

      {record.notes ? (
        <div className="detail-field">
          <span className="detail-label">Notes</span>
          <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{record.notes}</span>
        </div>
      ) : null}

      {record.photos?.length > 0 && (
        <div>
          <div className="detail-field">
            <span className="detail-label">Photos</span>
            <span className="detail-value">{record.photos.length} photo{record.photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="detail-photos">
            {record.photos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Photo ${i + 1}`}
                className="detail-photo"
                onClick={() => setLightboxSrc(src)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="detail-actions">
        <a href={emailHref} className="btn btn-secondary btn-sm">
          ✉️ Email report
        </a>
        <button className="btn btn-secondary btn-sm" onClick={handleShare}>
          🔗 Share
        </button>
        <button
          className={`btn btn-sm ${confirmDelete ? 'btn-danger' : 'btn-outline'}`}
          onClick={handleDelete}
        >
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
