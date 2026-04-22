import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

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
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'DELETE') {
    const { id } = req.query
    const records = readData().filter(r => r.id !== id)
    writeData(records)
    return res.json({ ok: true, remaining: records.length })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
