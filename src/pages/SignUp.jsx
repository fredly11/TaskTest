import React, { useState, useMemo } from 'react'
import { signUp, createUser } from '../services/auth'

function passwordStrength(pw){
  if(!pw) return { score:0, label:'', color:'' }
  let score = 0
  if(pw.length >= 8) score++
  if(/[A-Z]/.test(pw)) score++
  if(/[0-9]/.test(pw)) score++
  if(/[^A-Za-z0-9]/.test(pw)) score++
  if(score <= 1) return { score, label: 'Weak', color: 'weak' }
  if(score === 2) return { score, label: 'Medium', color: 'medium' }
  return { score, label: 'Strong', color: 'strong' }
}

export default function SignUp(){
  const [fullName,setFullName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [confirm,setConfirm] = useState('')
  const [tenant,setTenant] = useState('')
  const [agree,setAgree] = useState(false)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)
  const [success,setSuccess] = useState(null)

  const pwInfo = useMemo(()=>passwordStrength(password), [password])

  function validate(){
    if(!fullName) return 'Full name is required'
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
    if(password.length < 8) return 'Password must be at least 8 characters'
    if(password !== confirm) return 'Passwords do not match'
    if(!tenant) return 'Organization / tenant name is required'
    if(!agree) return 'You must accept the terms'
    return null
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const v = validate()
    if(v){ setError(v); return }
    setLoading(true)
    try{
      // Call the registration Lambda endpoint which provisions tenant and user
      const res = await createUser({ email, password, tenantName: tenant, fullName })
      setSuccess(res.message || 'Account created — check your email to verify')
      setFullName(''); setEmail(''); setPassword(''); setConfirm(''); setTenant(''); setAgree(false)
    }catch(err){
      setError(err.message || String(err))
    }finally{ setLoading(false) }
  }

  return (
    <section className="section">
      <div className="container" style={{maxWidth:560}}>
        <div className="card card-form">
          <h2>Create your account</h2>
          <p className="muted">Sign up to create your workspace and invite your team.</p>

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label>Full name</label>
              <input className="input" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Jane Doe" aria-label="Full name" required />
            </div>

            <div className="field">
              <label>Email</label>
              <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" type="email" aria-label="Email" required />
            </div>

            <div className="field">
              <label>Organization / Tenant</label>
              <input className="input" value={tenant} onChange={e=>setTenant(e.target.value)} placeholder="Acme, Inc." aria-label="Tenant" required />
            </div>

            <div className="field">
              <label>Password</label>
              <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" type="password" aria-label="Password" required />
              <div className="pw-row">
                <small className="muted">Minimum 8 characters, use letters, numbers, and symbols.</small>
                {pwInfo.label && <span className={`pw-label ${pwInfo.color}`}>{pwInfo.label}</span>}
              </div>
            </div>

            <div className="field">
              <label>Confirm password</label>
              <input className="input" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" type="password" aria-label="Confirm password" required />
            </div>

            <div className="field field-check">
              <label className="check">
                <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} />
                <span className="muted">I agree to the terms and privacy policy</span>
              </label>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="field">
              <button className="btn primary full" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
