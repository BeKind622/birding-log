import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'data.json')

function readData() {
  if (!existsSync(DATA_FILE)) return []
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return []
  }
}

function writeData(records) {
  writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8')
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '100mb' }))

app.get('/api/records', (req, res) => {
  res.json(readData())
})

app.post('/api/records', (req, res) => {
  const incoming = Array.isArray(req.body) ? req.body : [req.body]
  const existing = readData()
  const existingIds = new Set(existing.map(r => r.id))
  const toAdd = incoming.filter(r => r && r.id && !existingIds.has(r.id))
  const merged = [...existing, ...toAdd]
  writeData(merged)
  res.json({ saved: toAdd.length, total: merged.length })
})

app.delete('/api/records/:id', (req, res) => {
  const records = readData().filter(r => r.id !== req.params.id)
  writeData(records)
  res.json({ ok: true, remaining: records.length })
})

app.delete('/api/records', (req, res) => {
  writeData([])
  res.json({ ok: true, remaining: 0 })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Field Recorder server → http://localhost:${PORT}`)
  console.log(`Data file: ${DATA_FILE}`)
})
