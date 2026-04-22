import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// /tmp is writable on Vercel and persists for the lifetime of a warm Lambda instance.
// For true persistence across cold starts, replace with @vercel/kv or a database.
const DATA_FILE = join('/tmp', 'birding-records.json')

function readData() {
  if (!existsSync(DATA_FILE)) return []
  try { return JSON.parse(readFileSync(DATA_FILE, 'utf8')) } catch { return [] }
}

function writeData(records) {
  writeFileSync(DATA_FILE, JSON.stringify(records), 'utf8')
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    return res.json(readData())
  }

  if (req.method === 'POST') {
    const incoming = Array.isArray(req.body) ? req.body : [req.body]
    const existing = readData()
    const existingIds = new Set(existing.map(r => r.id))
    const toAdd = incoming.filter(r => r?.id && !existingIds.has(r.id))
    const merged = [...existing, ...toAdd]
    writeData(merged)
    return res.json({ saved: toAdd.length, total: merged.length })
  }

  if (req.method === 'DELETE') {
    writeData([])
    return res.json({ ok: true, remaining: 0 })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
