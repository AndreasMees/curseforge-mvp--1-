import { useState } from 'react'
import { api } from '../api.js'

export default function AuthModal({ mode, onSwitch, onSuccess, onClose }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      const data = isLogin
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form)
      onSuccess(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, width: '90%', maxWidth: 420, padding: '2rem', position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 16, background: 'none',
          border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer',
        }}>✕</button>

        <h2 style={{ fontFamily: 'Oxanium, monospace', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          {isLogin ? 'Tere tagasi' : 'Loo konto'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: '1.5rem' }}>
          {isLogin ? 'Logi sisse oma kontoga' : 'Liitu CurseForge kogukonnaga'}
        </p>

        {!isLogin && (
          <Field label="Kasutajanimi" value={form.username}
            onChange={v => setForm(f => ({ ...f, username: v }))}
            placeholder="cool_modder_99" />
        )}
        <Field label="E-post" type="email" value={form.email}
          onChange={v => setForm(f => ({ ...f, email: v }))}
          placeholder="kasutaja@näide.ee" />
        <Field label="Parool" type="password" value={form.password}
          onChange={v => setForm(f => ({ ...f, password: v }))}
          placeholder="••••••••"
          onEnter={handleSubmit} />

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '0.5rem' }}>⚠️ {error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', background: 'var(--accent)', border: 'none', color: '#fff',
          padding: 11, borderRadius: 7, fontSize: 14, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
          marginTop: '0.5rem',
        }}>
          {loading ? 'Palun oota...' : (isLogin ? 'Logi sisse' : 'Loo konto')}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--muted)' }}>
          {isLogin ? 'Pole kontot? ' : 'Juba liige? '}
          <a onClick={() => onSwitch(isLogin ? 'register' : 'login')}
            style={{ color: 'var(--accent)', cursor: 'pointer' }}>
            {isLogin ? 'Registreeru siin' : 'Logi sisse'}
          </a>
        </p>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, onEnter }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 7, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none',
        }}
      />
    </div>
  )
}
