const STORAGE_KEY = 'field_recorder_records'

export const loadRecords = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const saveRecords = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (e) {
    console.error('Storage quota exceeded:', e)
  }
}

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
