import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildCognitoUrl } from '../lib/cognito'
import { useAuth } from '../contexts/AuthContext'

export default function SignIn() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/')
    }
  }, [auth.isAuthenticated, navigate])

  const handleLogin = () => {
    window.location.href = buildCognitoUrl('login')
  }

  const handleSignup = () => {
    window.location.href = buildCognitoUrl('signup')
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1>Sign In</h1>
        <p className="muted">Use the AWS Cognito hosted UI to sign in or create a new account.</p>

        <button type="button" className="btn full btn-primary" onClick={handleLogin}>
          Sign in with Cognito
        </button>

        <button type="button" className="btn full btn-secondary" onClick={handleSignup}>
          Sign up with Cognito
        </button>

        <div className="signin-footer">
          <p>If you already have an account, use the button above to sign in with Cognito.</p>
        </div>
      </div>
    </div>
  )
}
