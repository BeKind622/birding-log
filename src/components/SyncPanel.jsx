import { useState, useEffect } from 'react'
import { useRecords } from '../context/RecordsContext.jsx'
import { uploadRecords, downloadRecords } from '../utils/api.js'
import { getCategoryConfig } from '../utils/categories.js'

export default function SyncPanel() {
  const { records, markSynced, mergeRecords, deleteRecord } = useRecords()
  const [online, setOnline] = useState(navigator.onLine)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const unsynced = records.filter(r => !r.synced)

  const handleUpload = async () => {
    if (!unsynced.length) return
    setUploading(true)
    setResult(null)
    try {
      const res = await uploadRecords(unsynced)
      markSynced(unsynced.map(r => r.id))
      setResult({ ok: true, msg: `✓ Uploaded ${unsynced.length} record${unsynced.length !== 1 ? 's' : ''}. Server total: ${res.total}` })
    } catch (e) {
      setResult({ ok: false, msg: `Upload failed: ${e.message}` })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setResult(null)
    try {
      const serverRecords = await downloadRecords()
      const added = mergeRecords(serverRecords)
      setResult({ ok: true, msg: `✓ Server has ${serverRecords.length} record${serverRecords.length !== 1 ? 's' : ''}. ${added} new added locally.` })
    } catch (e) {
      setResult({ ok: false, msg: `Download failed: ${e.message}` })
    } finally {
      setDownloading(false)
    }
  }

  const synced    = records.filter(r =>  r.synced)
  const hasPhotos = records.reduce((n, r) => n + (r.photos?.length || 0), 0)

  return (
    <div className="sync-panel">
      {/* Connection status */}
      <div className="sync-status-bar">
        <span className={online ? 'online-dot' : 'offline-dot'} />
        <span>{online ? 'Online' : 'Offline — saved locally'}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#888' }}>
          {records.length} record{records.length !== 1 ? 's' : ''} on device
        </span>
      </div>

      {/* Stats */}
      <div className="section-card">
        <div className="section-title">Storage Summary</div>
        <div className="detail-field">
          <span className="detail-label">Total records</span>
          <span className="detail-value">{records.length}</span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Synced</span>
          <span className="detail-value" style={{ color: '#2e7d32' }}>
            {synced.length}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Pending upload</span>
          <span className="detail-value" style={{ color: unsynced.length > 0 ? '#e65100' : '#2e7d32' }}>
            {unsynced.length}
          </span>
        </div>
        <div className="detail-field">
          <span className="detail-label">Total photos</span>
          <span className="detail-value">{hasPhotos}</span>
        </div>
      </div>

      {/* Sync actions */}
      <div className="section-card">
        <div className="section-title">Server Sync</div>
        <div className="sync-actions">
          <button
            className="btn btn-primary btn-full"
            onClick={handleUpload}
            disabled={!online || uploading || unsynced.length === 0}
          >
            {uploading
              ? <><span className="spinner" />&nbsp;Uploading…</>
              : `⬆ Upload ${unsynced.length} pending record${unsynced.length !== 1 ? 's' : ''}`}
          </button>
          <button
            className="btn btn-secondary btn-full"
            onClick={handleDownload}
            disabled={!online || downloading}
          >
            {downloading
              ? <><span className="spinner dark" />&nbsp;Downloading…</>
              : '⬇ Download from server'}
          </button>
        </div>
        {!online && (
          <p style={{ fontSize: '0.78rem', color: '#999', marginTop: 10, textAlign: 'center' }}>
            Connect to the internet to sync
          </p>
        )}
        {result && (
          <div className={`sync-result ${result.ok ? 'success' : 'error'}`}>
            {result.msg}
          </div>
        )}
      </div>

      {/* Breakdown by category */}
      {records.length > 0 && (
        <div className="section-card">
          <div className="section-title">Breakdown by Category</div>
          {Object.entries(
            records.reduce((acc, r) => {
              acc[r.category] = (acc[r.category] || 0) + 1
              return acc
            }, {})
          ).map(([cat, count]) => {
            const cfg = getCategoryConfig(cat)
            return (
              <div key={cat} className="detail-field">
                <span className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                </span>
                <span className="detail-value">{count} record{count !== 1 ? 's' : ''}</span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ padding: '4px 4px 8px', fontSize: '0.75rem', color: '#aaa', lineHeight: 1.5 }}>
        Sightings are stored on-device in localStorage and optionally synced to the server (localhost:3001). Run <code style={{ background: '#eee', padding: '1px 4px', borderRadius: 3 }}>npm start</code> to start both servers.
      </div>
    </div>
  )
}
