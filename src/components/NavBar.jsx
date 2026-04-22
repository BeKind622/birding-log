import { useRecords } from '../context/RecordsContext.jsx'

export default function NavBar({ active, onNavigate }) {
  const { records } = useRecords()
  const unsyncedCount = records.filter(r => !r.synced).length

  const tabs = [
    { id: 'new',  icon: '🐦', label: 'Log' },
    { id: 'list', icon: '🔭', label: 'Sightings', badge: records.length || null },
    { id: 'sync', icon: '☁️', label: 'Sync',      badge: unsyncedCount || null },
  ]

  return (
    <nav className="nav-bar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${active === tab.id ? 'active' : ''}`}
          onClick={() => onNavigate(tab.id)}
        >
          {tab.badge != null && <span className="nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>}
          <span className="nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
