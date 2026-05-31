import { useState } from 'react'
import { api } from '../api.js'

const GAME_ICONS = { minecraft: '⛏️', wow: '⚔️', valheim: '🪓', stardew: '🌾', skyrim: '🐉', factorio: '⚙️', rimworld: '🚀', kerbal: '🛸' }
const GAME_NAMES = { minecraft: 'Minecraft', wow: 'WoW', valheim: 'Valheim', stardew: 'Stardew Valley', skyrim: 'Skyrim', factorio: 'Factorio', rimworld: 'RimWorld', kerbal: 'Kerbal' }

function fmtNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K'
  return String(n)
}

export default function ModCard({ mod, user, onDeleted, showToast }) {
  const [dlState, setDlState] = useState('idle')

  async function handleDownload() {
    setDlState('loading')
    try {
      const res = await api.downloadMod(mod.id)
      if (res.url) {
        window.open(res.url, '_blank')
        showToast(`✅ "${mod.name}" allalaadimine avatud!`)
      } else {
        showToast(`✅ "${mod.name}" allalaadimine alustatud!`)
      }
      setDlState('done')
      setTimeout(() => setDlState('idle'), 3000)
    } catch {
      setDlState('idle')
      showToast('Allalaadimine ebaõnnestus', 'error')
    }
  }

  async function handleDelete() {
    if (!confirm(`Kustuta "${mod.name}"?`)) return
    try {
      await api.deleteMod(mod.id)
      showToast('Mod kustutatud')
      onDeleted?.(mod.id)
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const isOwner = user && user.username === mod.author_name

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
      padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.2s, background 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {mod.thumb ? (
          <img src={mod.thumb} alt={mod.name} style={{
            width: 52, height: 52, borderRadius: 8, objectFit: 'cover',
            border: '1px solid var(--border)', flexShrink: 0,
          }} onError={e => { e.target.style.display='none' }} />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: 8, background: 'var(--surface2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, border: '1px solid var(--border)', flexShrink: 0,
          }}>
            {GAME_ICONS[mod.game] || '📦'}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {mod.url ? (
              <a href={mod.url} target="_blank" rel="noreferrer"
                style={{ color: 'var(--text)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color='var(--accent)'}
                onMouseLeave={e => e.target.style.color='var(--text)'}
              >{mod.name}</a>
            ) : mod.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            by {mod.author_name} · {GAME_NAMES[mod.game] || mod.game}
          </div>
        </div>
        {isOwner && (
          <button onClick={handleDelete} title="Kustuta" style={{
            background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 16, padding: 2,
          }}>🗑️</button>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>{mod.description}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>⬇️ {fmtNum(mod.downloads)}</span>
          {mod.version && mod.version !== '—' && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>📦 {mod.version}</span>
          )}
        </div>
        <button onClick={handleDownload} disabled={dlState === 'loading'} style={{
          background: dlState === 'done' ? 'rgba(34,197,94,0.2)' : 'var(--accent)',
          border: dlState === 'done' ? '1px solid rgba(34,197,94,0.4)' : 'none',
          color: dlState === 'done' ? '#22c55e' : '#fff',
          padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          cursor: dlState === 'loading' ? 'not-allowed' : 'pointer',
          opacity: dlState === 'loading' ? 0.7 : 1,
        }}>
          {dlState === 'loading' ? 'Laadimine...' : dlState === 'done' ? '✓ Avatud' : 'Laadi alla'}
        </button>
      </div>
    </div>
  )
}
