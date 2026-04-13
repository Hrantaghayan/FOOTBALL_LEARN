import { createContext, useContext, useState } from 'react'

const VALID_EMAIL = 'ArmenQotanjyan@gmail.com'
const VALID_PASSWORD = 'AAFLARMENJAN123'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('isLoggedIn') === 'true'
  )

  function login(email, password) {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true')
      setIsLoggedIn(true)
      return null
    }
    return 'login.error'
  }

  function logout() {
    localStorage.clear()
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
