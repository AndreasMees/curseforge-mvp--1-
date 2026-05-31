import { useState, useEffect } from 'react'
import { api } from '../api.js'
import ModCard from '../components/ModCard.jsx'

const GAMES = [
  { id: 'minecraft', name: 'Minecraft', icon: '⛏️', count: '58K+' },
  { id: 'wow', name: 'World of Warcraft', icon: '⚔️', count: '22K+' },
  { id: 'valheim', name: 'Valheim', icon: '🪓', count: '9K+' },
  { id: 'stardew', name: 'Stardew Valley', icon: '🌾', count: '7K+' },
  { id: 'skyrim', name: 'Skyrim', icon: '🐉', count: '31K+' },
  { id: 'factorio', name: 'Factorio', icon: '⚙️', count: '4K+' },
  { id: 'rimworld', name: 'RimWorld', icon: '🚀', count: '5K+' },
  { id: 'kerbal', name: 'Kerbal Space', icon: '🛸', count: '2K+' },
]

export default function HomePage({ onBrowse, showToast }) {
  const [mods, setMods] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getMods({ sort: 'popular' }).then(setMods).catch(() => {})
  }, [])

  function handleSearch(e) {
    if (e.key === 'Enter' && search.trim()) onBrowse('all')
  }

  return (
    <div>
      {/* Hero */}
      <div style={{
        padding: '4rem 2rem 3rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 60%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'inline-block', background: 'rgba(249,115,22,0.15)',
          border: '1px solid rgba(249,115,22,0.3)', color: 'var(--accent)',
          fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase',
          padding: '4px 14px', borderRadius: 20, marginBottom: '1.2rem',
        }}>🎮 Avasta · Laadi · Mängi</div>

        <h1 style={{ fontFamily: 'Oxanium, monospace', fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem' }}>
          Kõik modid,<br /><span style={{ color: 'var(--accent)' }}>ühes kohas</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.6 }}>
          Sirvib tuhandeid mode Minecraftile, WoWile ja muudele. Tasuta, kiirelt, usaldusväärselt.
        </p>

        <div style={{ display: 'flex', maxWidth: 600, margin: '0 auto', gap: 8 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            placeholder="Otsi mode, pakette, pluginaid..."
            style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 18px', color: 'var(--text)', fontSize: 15, outline: 'none',
            }}
          />
          <button onClick={() => onBrowse('all')} style={{
            background: 'var(--accent)', border: 'none', color: '#fff',
            padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Otsi</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', gap: '2rem', justifyContent: 'center', padding: '1.2rem 2rem',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {[['148K+','Moodifikatsiooni'],['12','Mängu'],['3.2M+','Allalaadimist'],['89K+','Loojat']].map(([n, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Oxanium, monospace', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Games */}
      <div style={{ padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Oxanium, monospace', fontSize: 18, fontWeight: 700 }}>Vali mäng</h2>
          <a onClick={() => onBrowse('all')} style={{ color: 'var(--accent)', fontSize: 13, cursor: 'pointer' }}>Kõik mängud →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {GAMES.map(g => (
            <div key={g.id} onClick={() => onBrowse(g.id)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '1.2rem 1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.background = 'var(--surface2)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{g.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{g.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{g.count} moddi</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured mods */}
      <div style={{ padding: '0 2rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Oxanium, monospace', fontSize: 18, fontWeight: 700 }}>Populaarsed modid</h2>
          <a onClick={() => onBrowse('all')} style={{ color: 'var(--accent)', fontSize: 13, cursor: 'pointer' }}>Vaata kõiki →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {mods.slice(0, 6).map(m => (
            <ModCard key={m.id} mod={m} showToast={showToast} />
          ))}
        </div>
      </div>
    </div>
  )
}
