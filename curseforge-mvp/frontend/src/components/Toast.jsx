export default function Toast({ msg, type = 'success' }) {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.4)', text: '#22c55e' },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' },
  }
  const c = colors[type] || colors.success
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
      zIndex: 999, animation: 'slideUp 0.3s ease',
    }}>
      {msg}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
