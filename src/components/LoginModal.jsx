import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './LoginModal.css'

function LoginModal() {
  const { isLoggedIn, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isLoggedIn) return null

  function handleSubmit(e) {
    e.preventDefault()
    const err = login(email, password)
    if (err) setError(err)
  }

  return (
    <div className="login-overlay">
      <div className="login-box">
        <div className="login-logo">⚽</div>
        <h2 className="login-title">Football Dock</h2>
        <p className="login-subtitle">Sign in to continue</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
