import { useState } from 'react'
import { RecordsProvider } from './context/RecordsContext.jsx'
import NavBar from './components/NavBar.jsx'
import RecordForm from './components/RecordForm.jsx'
import RecordsList from './components/RecordsList.jsx'
import SyncPanel from './components/SyncPanel.jsx'

const VIEW_LABELS = { new: 'Log Sighting', list: 'My Sightings', sync: 'Sync' }

export default function App() {
  const [activeView, setActiveView] = useState('new')

  return (
    <RecordsProvider>
      <div className="app">
        <header className="app-header">
          <h1>🐦 Birding Log</h1>
          <span className="header-subtitle">{VIEW_LABELS[activeView]}</span>
        </header>
        <main className="app-main">
          {activeView === 'new'  && <RecordForm onSave={() => setActiveView('list')} />}
          {activeView === 'list' && <RecordsList />}
          {activeView === 'sync' && <SyncPanel />}
        </main>
        <NavBar active={activeView} onNavigate={setActiveView} />
      </div>
    </RecordsProvider>
  )
}
