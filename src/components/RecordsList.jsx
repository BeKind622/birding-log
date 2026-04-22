import { useState } from 'react'
import { useRecords } from '../context/RecordsContext.jsx'
import { CATEGORIES, getCategoryConfig } from '../utils/categories.js'
import RecordDetail from './RecordDetail.jsx'

function fmtDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function RecordsList() {
  const { records } = useRecords()
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
      {/* Search */}
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

      {/* Category filter chips */}
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

                {isExpanded && <RecordDetail record={record} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
