import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import './LoginModal.css'

function LoginModal() {
  const { isLoggedIn, login } = useAuth()
  const { lang, t, switchLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  if (isLoggedIn) return null

  function handleSubmit(e) {
    e.preventDefault()
    const err = login(email, password)
    if (err) setErrorKey(err)
  }

  return (
    <div className="login-overlay">
      <div className="login-box">
        <div className="login-logo">⚽</div>
        <h2 className="login-title">{t('login.title')}</h2>
        <p className="login-subtitle">{t('login.subtitle')}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorKey('') }}
              placeholder={t('login.email.placeholder')}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label>{t('login.password')}</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorKey('') }}
                placeholder={t('login.password.placeholder')}
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

          <div className="lang-switcher">
            <button
              type="button"
              className={`lang-btn ${lang === 'en' ? 'lang-active' : ''}`}
              onClick={() => switchLanguage('en')}
              title="English"
            >
              🇬🇧
            </button>
            <button
              type="button"
              className={`lang-btn ${lang === 'ru' ? 'lang-active' : ''}`}
              onClick={() => switchLanguage('ru')}
              title="Русский"
            >
              🇷🇺
            </button>
          </div>

          {errorKey && <p className="login-error">{t(errorKey)}</p>}

          <button type="submit" className="login-btn">{t('login.button')}</button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
