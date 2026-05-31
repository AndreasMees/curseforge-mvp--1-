import { useState } from 'react'
import { api } from '../api.js'

const GAMES = [
  { id: 'minecraft', label: 'Minecraft' },
  { id: 'wow', label: 'World of Warcraft' },
  { id: 'valheim', label: 'Valheim' },
  { id: 'stardew', label: 'Stardew Valley' },
  { id: 'skyrim', label: 'Skyrim' },
  { id: 'factorio', label: 'Factorio' },
  { id: 'rimworld', label: 'RimWorld' },
  { id: 'kerbal', label: 'Kerbal Space Program' },
]

export default function UploadPage({ user, onLogin, showToast, onDone }) {
  const [form, setForm] = useState({ name: '', description: '', game: 'minecraft', version: '1.0.0' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontFamily: 'Oxanium, monospace', fontSize: 22, fontWeight: 700, marginBottom: '0.5rem' }}>Sisselogimine nõutav</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Modide üleslaadimiseks pead olema sisse logitud.</p>
        <button onClick={onLogin} style={{
          background: 'var(--accent)', border: 'none', color: '#fff',
          padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Logi sisse</button>
      </div>
    )
  }

  async function handleSubmit() {
    if (!form.name || !form.game) return showToast('Nimi ja mäng on kohustuslikud', 'error')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('file', file)
      const res = await api.uploadMod(fd)
      if (res.error) throw new Error(res.error)
      showToast('🎉 Mod edukalt üles laaditud!')
      onDone()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'Oxanium, monospace', fontSize: 22, fontWeight: 700, marginBottom: '0.4rem' }}>
        Laadi mod üles
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '2rem' }}>
        Jagage oma moodifikatsioone CurseForge kogukonnaga
      </p>

      <Field label="Moda nimi *">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Minu Äge Mod" style={inputStyle} />
      </Field>

      <Field label="Mäng *">
        <select value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} style={inputStyle}>
          {GAMES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
        </select>
      </Field>

      <Field label="Kirjeldus">
        <textarea value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Kirjelda mida mod teeb..."
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>

      <Field label="Versioon">
        <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
          placeholder="1.0.0" style={inputStyle} />
      </Field>

      <Field label="Mod fail (.zip, .jar, .pak)">
        <input type="file" accept=".zip,.jar,.pak,.rar,.7z"
          onChange={e => setFile(e.target.files[0])}
          style={{ ...inputStyle, padding: '8px 14px' }} />
        {file && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>✓ {file.name}</div>}
      </Field>

      <button onClick={handleSubmit} disabled={loading} style={{
        background: 'var(--accent)', border: 'none', color: '#fff',
        padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
        marginTop: '0.5rem',
      }}>
        {loading ? 'Üleslaadimine...' : '📤 Laadi mod üles'}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 7, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
}
