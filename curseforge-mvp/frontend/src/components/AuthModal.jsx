import React, { useState } from 'react';
import { api } from '../api';

function AuthModal({ mode, setMode, onClose, onAuth, onToast }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('📝 Form submitted:', { mode, email, username });
    
    try {
      if (mode === 'login') {
        console.log('🔐 Trying to login...');
        const data = await api.login({ email, password });
        console.log('✅ Login response:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onAuth({ username: data.username });
        onToast('Sisselogimine õnnestus!', 'success');
        onClose();
      } else {
        console.log('📝 Trying to register...');
        if (password.length < 6) {
          onToast('Parool peab olema vähemalt 6 tähemärki', 'error');
          setLoading(false);
          return;
        }
        const data = await api.register({ username, email, password });
        console.log('✅ Register response:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        onAuth({ username: data.username });
        onToast('Registreerumine õnnestus!', 'success');
        onClose();
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      onToast(error.message || 'Midagi läks valesti', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{mode === 'login' ? 'Tere tagasi' : 'Loo konto'}</h2>
        <p style={{ color: '#8b8f95', marginBottom: '1.5rem' }}>
          {mode === 'login' ? 'Logi sisse oma kontoga' : 'Registreeru uueks kasutajaks'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Kasutajanimi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Parool (min 6 tähemärki)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Laen...' : (mode === 'login' ? 'Logi sisse' : 'Registreeru')}
          </button>
        </form>
        
        <div className="auth-switch" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Pole kontot? Registreeru siin' : 'On juba konto? Logi sisse'}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;