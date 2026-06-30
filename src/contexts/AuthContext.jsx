import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { COGNITO_DOMAIN, CLIENT_ID, getLogoutUri } from '../lib/cognito'

const AuthContext = createContext(null)

function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function getStoredTokens() {
  const idToken = localStorage.getItem('idToken')
  if (!idToken) return null
  return {
    idToken,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}

function getUserFromIdToken(idToken) {
  const payload = decodeJwt(idToken)
  if (!payload) return null
  return {
    username:
      payload['cognito:username'] ||
      payload.preferred_username ||
      payload.email ||
      payload.sub,
    email: payload.email,
    raw: payload,
  }
}

function buildLogoutUrl() {
  return `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(getLogoutUri())}`
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const tokens = getStoredTokens()
    return tokens ? getUserFromIdToken(tokens.idToken) : null
  })

  const refreshUser = () => {
    const tokens = getStoredTokens()
    setUser(tokens ? getUserFromIdToken(tokens.idToken) : null)
  }

  useEffect(() => {
    const handleAuthChanged = () => refreshUser()
    window.addEventListener('authChanged', handleAuthChanged)
    return () => window.removeEventListener('authChanged', handleAuthChanged)
  }, [])

  const signOut = () => {
    localStorage.removeItem('idToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    window.location.href = buildLogoutUrl()
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      signOut,
      tokens: getStoredTokens(),
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
