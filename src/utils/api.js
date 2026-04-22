const API_BASE = '/api'

export const uploadRecords = async (records) => {
  const res = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(records)
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export const downloadRecords = async () => {
  const res = await fetch(`${API_BASE}/records`)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return res.json()
}

export const deleteServerRecord = async (id) => {
  const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
  return res.json()
}
