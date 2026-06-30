import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { COGNITO_DOMAIN, CLIENT_ID, getRedirectUri } from '../lib/cognito'

export default function Callback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setError('No authorization code found in the callback URL.')
      return
    }

    exchangeCodeForTokens(code)
  }, [searchParams])

  const exchangeCodeForTokens = async (code) => {
    try {
      const redirectUri = getRedirectUri()
      const tokenResponse = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code,
          redirect_uri: redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => null)
        throw new Error(errorData?.error_description || 'Failed to exchange code for tokens.')
      }

      const data = await tokenResponse.json()
      localStorage.setItem('idToken', data.id_token)
      localStorage.setItem('accessToken', data.access_token)
      localStorage.setItem('refreshToken', data.refresh_token)
      window.dispatchEvent(new Event('authChanged'))

      navigate('/')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Login callback failed.')
    }
  }

  return (
    <div className="callback-container">
      <div className="callback-card">
        <h1>Logging you in...</h1>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  )
}
