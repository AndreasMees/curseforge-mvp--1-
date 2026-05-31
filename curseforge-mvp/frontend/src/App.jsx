import { useState, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import HomePage from './pages/HomePage.jsx'
import BrowsePage from './pages/BrowsePage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import AuthModal from './components/AuthModal.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  const [page, setPage] = useState('home')
  const [user, setUser] = useState(null)
  const [authModal, setAuthModal] = useState(null) // 'login' | 'register' | null
  const [toast, setToast] = useState(null)
  const [gameFilter, setGameFilter] = useState('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) setUser({ token, username })
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleAuth(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('username', data.username)
    setUser(data)
    setAuthModal(null)
    showToast(`Tere tulemast, ${data.username}! 🎉`)
  }

  function handleLogout() {
    localStorage.clear()
    setUser(null)
    showToast('Oled välja logitud')
  }

  function goToBrowse(game = 'all') {
    setGameFilter(game)
    setPage('browse')
  }

  return (
    <>
      <Nav
        user={user}
        page={page}
        onNavigate={setPage}
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
        onLogout={handleLogout}
      />

      {page === 'home' && (
        <HomePage
          onBrowse={goToBrowse}
          onLogin={() => setAuthModal('login')}
          showToast={showToast}
        />
      )}
      {page === 'browse' && (
        <BrowsePage
          initialGame={gameFilter}
          user={user}
          showToast={showToast}
        />
      )}
      {page === 'upload' && (
        <UploadPage
          user={user}
          onLogin={() => setAuthModal('login')}
          showToast={showToast}
          onDone={() => setPage('browse')}
        />
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onSwitch={setAuthModal}
          onSuccess={handleAuth}
          onClose={() => setAuthModal(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  )
}
