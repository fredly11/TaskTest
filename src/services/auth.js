// Lightweight auth service that can use either a backend API or AWS Amplify (Cognito).

// Lightweight auth service that posts to your backend API (API Gateway -> Lambda).
// Configure `VITE_API_URL` to your API endpoint.

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function signUp({ fullName, email, password, tenant }){
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password, tenant })
  })
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.message || 'Sign up failed')
  return data
}

// Create user via a registration API (Lambda). Prefer env var `VITE_REGISTER_URL`.
export async function createUser({ email, password, tenantName = 'My Team', fullName }){
  const REGISTER_URL = import.meta.env.VITE_REGISTER_URL || 'https://uqqb3xc36i.execute-api.us-east-2.amazonaws.com/dev/register'
  const res = await fetch(REGISTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantName, fullName })
  })
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.error || data.message || 'Registration failed')
  return data
}

export default { signUp }
