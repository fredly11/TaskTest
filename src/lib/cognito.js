export const COGNITO_DOMAIN = "https://us-east-2snx4huync.auth.us-east-2.amazoncognito.com"
export const CLIENT_ID = "6eba8a4mfbiamst84i5qv86g1q"
export const RESPONSE_TYPE = "code"
export const SCOPES = ["email", "openid", "phone"].join(" ")

export const getRedirectUri = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5173/callback'
  }
  return `${window.location.origin}/callback`
}

export const getLogoutUri = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5173'
  }
  return window.location.origin
}

export const buildCognitoUrl = (mode = "login") => {
  const redirectUri = getRedirectUri()
  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: RESPONSE_TYPE,
    scope: SCOPES,
    redirect_uri: redirectUri,
  })

  return `${COGNITO_DOMAIN}/${mode}?${query.toString()}`
}
