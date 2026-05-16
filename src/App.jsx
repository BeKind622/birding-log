import { useState, useEffect } from 'react'
import RecordForm from './components/RecordForm.jsx'
import RecordsList from './components/RecordsList.jsx'
import SyncPanel from './components/SyncPanel.jsx'
import './index.css'

const KEY  = 'birding_records'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const save = (r) => { try { localStorage.setItem(KEY, JSON.stringify(r)) } catch {} }
const uid  = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const TABS = [
  { id: 'new',  icon: '🐦', label: 'Log' },
  { id: 'list', icon: '🔭', label: 'Sightings' },
  { id: 'sync', icon: '☁️', label: 'Sync' },
]
const TITLES = { new: 'Log Sighting', list: 'My Sightings', sync: 'Sync' }

export default function App() {
  const [view, setView]       = useState('new')
  const [records, setRecords] = useState(load)

  useEffect(() => save(records), [records])

  const addRecord    = (data) => setRecords(p => [{ id: uid(), timestamp: new Date().toISOString(), synced: false, ...data }, ...p])
  const deleteRecord = (id)   => setRecords(p => p.filter(r => r.id !== id))
  const markSynced   = (ids)  => { const s = new Set(ids); setRecords(p => p.map(r => s.has(r.id) ? { ...r, synced: true } : r)) }
  const mergeRecords = (incoming) => {
    const existing = new Set(records.map(r => r.id))
    const fresh = incoming.filter(r => !existing.has(r.id)).map(r => ({ ...r, synced: true }))
    if (fresh.length) setRecords(p => [...fresh, ...p])
    return fresh.length
  }

  const unsynced = records.filter(r => !r.synced).length

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐦 Birding Log</h1>
        <span className="header-subtitle">{TITLES[view]}</span>
      </header>

      <main className="app-main">
        {view === 'new'  && <RecordForm onSave={(data) => { addRecord(data); setView('list') }} />}
        {view === 'list' && <RecordsList records={records} onDelete={deleteRecord} />}
        {view === 'sync' && <SyncPanel records={records} onMarkSynced={markSynced} onMerge={mergeRecords} />}
      </main>

      <nav className="nav-bar">
        {TABS.map(t => {
          const badge = t.id === 'list' ? (records.length || null) : t.id === 'sync' ? (unsynced || null) : null
          return (
            <button key={t.id} className={`nav-btn ${view === t.id ? 'active' : ''}`} onClick={() => setView(t.id)}>
              {badge != null && <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>}
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
