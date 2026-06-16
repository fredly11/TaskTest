import React, { useState } from 'react'
import { confirmSignUp, signIn } from '../services/auth'
import { useNavigate } from 'react-router-dom'

export default function ConfirmSignUp(){
  const [username,setUsername] = useState('')
  const [code,setCode] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const navigate = useNavigate()

  async function handleConfirm(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      await confirmSignUp(username, code)
      // after confirm, try to sign in automatically
      await signIn(username, code /* password fallback not available here */)
      navigate('/')
    }catch(err){
      setError(err.message || String(err))
    }finally{ setLoading(false) }
  }

  return (
    <section className="section">
      <div className="container" style={{maxWidth:520}}>
        <div className="card card-form">
          <h2>Confirm your account</h2>
          <p className="muted">Enter the verification code sent to your email.</p>
          <form onSubmit={handleConfirm} className="form">
            <div className="field">
              <label>Username / Email</label>
              <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="you@company.com" required />
            </div>

            <div className="field">
              <label>Confirmation code</label>
              <input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="123456" required />
            </div>

            {error && <div className="message error">{error}</div>}

            <div className="field">
              <button className="btn primary full" type="submit" disabled={loading}>{loading? 'Confirming…' : 'Confirm account'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
