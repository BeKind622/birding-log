import { createContext, useContext, useState, useEffect } from 'react'
import { loadRecords, saveRecords, generateId } from '../utils/storage.js'

const RecordsContext = createContext(null)

export function RecordsProvider({ children }) {
  const [records, setRecords] = useState(() => loadRecords())

  useEffect(() => {
    saveRecords(records)
  }, [records])

  const addRecord = (data) => {
    const record = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      synced: false,
      ...data
    }
    setRecords(prev => [record, ...prev])
    return record
  }

  const updateRecord = (id, updates) => {
    setRecords(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates, synced: false } : r)
    )
  }

  const deleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const markSynced = (ids) => {
    const idSet = new Set(ids)
    setRecords(prev => prev.map(r => idSet.has(r.id) ? { ...r, synced: true } : r))
  }

  const mergeRecords = (incoming) => {
    const existingIds = new Set(records.map(r => r.id))
    const newOnes = incoming
      .filter(r => r && r.id && !existingIds.has(r.id))
      .map(r => ({ ...r, synced: true }))
    if (newOnes.length > 0) {
      setRecords(prev => [...newOnes, ...prev])
    }
    return newOnes.length
  }

  return (
    <RecordsContext.Provider value={{ records, addRecord, updateRecord, deleteRecord, markSynced, mergeRecords }}>
      {children}
    </RecordsContext.Provider>
  )
}

export const useRecords = () => useContext(RecordsContext)
