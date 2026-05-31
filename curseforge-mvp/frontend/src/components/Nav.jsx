export default function Nav({ user, page, onNavigate, onLogin, onRegister, onLogout }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: 56,
      background: 'rgba(13,15,20,0.97)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div
        onClick={() => onNavigate('home')}
        style={{ fontFamily: 'Oxanium, monospace', fontWeight: 800, fontSize: 20, color: 'var(--accent)', cursor: 'pointer' }}
      >
        CURSE<span style={{ color: 'var(--text)' }}>FORGE</span>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {['home', 'browse', 'upload'].map(p => (
          <button key={p} onClick={() => onNavigate(p)} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            color: page === p ? 'var(--text)' : 'var(--muted)',
            transition: 'color 0.2s',
          }}>
            {{ home: 'Avaleht', browse: 'Sirvi', upload: 'Laadi üles' }[p]}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>👋 {user.username}</span>
            <button onClick={onLogout} style={btnStyle('ghost')}>Logi välja</button>
          </>
        ) : (
          <>
            <button onClick={onLogin} style={btnStyle('ghost')}>Logi sisse</button>
            <button onClick={onRegister} style={btnStyle('primary')}>Registreeru</button>
          </>
        )}
      </div>
    </nav>
  )
}

function btnStyle(type) {
  const base = { padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
  if (type === 'primary') return { ...base, background: 'var(--accent)', border: 'none', color: '#fff' }
  return { ...base, background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }
}
