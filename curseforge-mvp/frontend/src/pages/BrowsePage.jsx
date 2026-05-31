import { useState, useEffect } from 'react'
import { api } from '../api.js'
import ModCard from '../components/ModCard.jsx'

const GAMES = ['minecraft','wow','valheim','stardew','skyrim','factorio','rimworld','kerbal']
const GAME_LABELS = { minecraft:'Minecraft', wow:'WoW', valheim:'Valheim', stardew:'Stardew', skyrim:'Skyrim', factorio:'Factorio', rimworld:'RimWorld', kerbal:'Kerbal' }

export default function BrowsePage({ initialGame = 'all', user, showToast }) {
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState(initialGame)
  const [sort, setSort] = useState('popular')
  const [q, setQ] = useState('')

  useEffect(() => { setGame(initialGame) }, [initialGame])

  useEffect(() => {
    setLoading(true)
    const params = { sort }
    if (game !== 'all') params.game = game
    if (q.trim()) params.q = q.trim()
    api.getMods(params).then(data => { setMods(data); setLoading(false) }).catch(() => setLoading(false))
  }, [game, sort, q])

  function handleDeleted(id) { setMods(m => m.filter(x => x.id !== id)) }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Oxanium, monospace', fontSize: 22, fontWeight: 700, marginBottom: '1.2rem' }}>
        {game === 'all' ? 'Kõik modid' : `${GAME_LABELS[game] || game} modid`}
      </h1>

      <input
        value={q} onChange={e => setQ(e.target.value)}
        placeholder="Otsi moda..."
        style={{
          width: '100%', maxWidth: 600, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 16px', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: '1rem',
        }}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Mäng:</span>
        {['all', ...GAMES].map(g => (
          <FilterBtn key={g} active={game === g} onClick={() => setGame(g)}>
            {g === 'all' ? 'Kõik' : GAME_LABELS[g]}
          </FilterBtn>
        ))}
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>Sort:</span>
        {[['popular','Populaarne'],['new','Uusimad']].map(([v,l]) => (
          <FilterBtn key={v} active={sort === v} onClick={() => setSort(v)}>{l}</FilterBtn>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Laadimine...</p>
      ) : mods.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Midagi ei leitud 🤷</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {mods.map(m => (
            <ModCard key={m.id} mod={m} user={user} onDeleted={handleDeleted} showToast={showToast} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(249,115,22,0.15)' : 'var(--surface)',
      border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid var(--border)',
      color: active ? 'var(--accent)' : 'var(--muted)',
      padding: '5px 13px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    }}>{children}</button>
  )
}
