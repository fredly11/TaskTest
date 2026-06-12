// Lightweight auth service to keep front-end decoupled from implementation.
// Use `import.meta.env.VITE_API_URL` to point to your API Gateway / Lambda or a proxy.

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

// Example stub showing how to integrate with Cognito directly (optional):
// import { CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js'
// export async function signUpWithCognito({ email, password, attributes, userPoolId, clientId }){ ... }

export default { signUp }
