const API_BASE = import.meta.env.VITE_API_URL || 'https://uqqb3xc36i.execute-api.us-east-2.amazonaws.com/dev'

function getIdToken() {
  return localStorage.getItem('idToken')
}

function handleAuthError() {
  // Clear tokens, notify app, and redirect to sign-in
  localStorage.removeItem('idToken')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.dispatchEvent(new Event('authChanged'))
  window.location.href = '/signin'
}

async function request(method, path, body = undefined, opts = {}) {
  const url = API_BASE + path
  const token = getIdToken()
  const headers = new Headers(opts.headers || {})

  // console.log(`[API] ${method} ${path}`, { hasToken: !!token, tokenLength: token?.length })
  
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (body && !(body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const requestBody = body && !(body instanceof FormData) ? JSON.stringify(body) : body
  // console.log(`[API] ${method} ${path} sending`, { requestBody })

  const res = await fetch(url, {
    method,
    headers,
    body: requestBody,
    credentials: opts.credentials || 'same-origin',
  })

  // console.log(`[API] ${method} ${path} - Status: ${res.status}`)
  
  if (res.status === 401) {
    // console.log(`[API] Auth error (401), clearing tokens and redirecting`)
    handleAuthError()
    const err = new Error('Unauthorized')
    err.status = res.status
    throw err
  }

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch (e) {
    data = text
  }

  if (!res.ok) {
    // console.log(`[API] ${method} ${path} failed`, { status: res.status, body: data })
    const err = new Error((data && data.message) || res.statusText || text || 'Request failed')
    err.status = res.status
    err.response = data
    throw err
  }

  return data
}

export async function createTeam(name) {
  return request('POST', '/teams', { name })
}

export async function getMyTeams() {
  try {
    const data = await request('GET', '/teams')
    return Array.isArray(data) ? data : (data && data.teams) || []
  } catch (err) {
    return Promise.reject({ message: err.message || 'Failed to fetch teams', status: err.status || 500, data: err.response || null })
  }
}

export async function addMemberToTeam(teamId, username) {
  // console.log('addMemberToTeam request:', { teamId, username })
  try {
    const data = await request('POST', `/teams/${encodeURIComponent(teamId)}/members`, { teamId, username })
    // console.log('addMemberToTeam response:', data)
    return data
  } catch (err) {
    console.error('addMemberToTeam error:', err)
    throw err
  }
}

export async function createList(name, teamId, tenantId) {
  return request('POST', '/lists', { name, teamId, tenantId })
}

export async function getLists(teamId, tenantId) {
  let path = '/lists'
  const params = new URLSearchParams()

  if (teamId) {
    params.set('teamId', teamId)
  }

  if (tenantId) {
    params.set('tenantId', tenantId)
  }

  const query = params.toString()
  if (query) {
    path += `?${query}`
  }

  try {
    const data = await request('GET', path)
    return Array.isArray(data) ? data : (data && data.lists) || []
  } catch (err) {
    return Promise.reject({
      message: err.message || 'Failed to fetch lists',
      status: err.status || 500,
      data: err.response || null,
    })
  }
}

export async function createTask(listId, taskData) {
  try {
    const data = await request('POST', `/lists/${encodeURIComponent(listId)}/tasks`, taskData)
    return data
  } catch (err) {
    console.error('[createTask] error:', err)
    throw err
  }
}

export async function getTasks(listId, teamId, tenantId) {
  try {
    let path = `/lists/${encodeURIComponent(listId)}/tasks`
    const params = new URLSearchParams()
    if (teamId) params.set('teamId', teamId)
    if (tenantId) params.set('tenantId', tenantId)
    const query = params.toString()
    if (query) path += `?${query}`
    console.log('[getTasks] request:', { path, listId, teamId: teamId || null, tenantId: tenantId || null })
    const data = await request('GET', path)
    console.log('[getTasks] raw response:', data)
    const items = Array.isArray(data) ? data : (data && (data.items || data.tasks)) || []
    console.log('[getTasks] normalized items:', { count: Array.isArray(items) ? items.length : 0, items })
    return items
  } catch (err) {
    console.error('[getTasks] error:', err)
    return Promise.reject({ message: err.message || 'Failed to fetch tasks', status: err.status || 500, data: err.response || null })
  }
}

export async function updateTask(listId, taskId, updates) {
  try {
    console.log('[updateTask] request:', { listId, taskId, updates })
    const data = await request('PATCH', `/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`, updates)
    console.log('[updateTask] response:', data)
    return data
  } catch (err) {
    console.error('[updateTask] error:', err)
    throw err
  }
}

export async function removeMemberFromTeam(teamId, username) {
  try {
    // Some backends accept DELETE with a JSON body; if yours expects query param, adjust accordingly.
    const data = await request('DELETE', `/teams/${encodeURIComponent(teamId)}/members`, { username })
    return data || { success: true }
  } catch (err) {
    return Promise.reject({ message: err.message || 'Failed to remove member', status: err.status || 500, data: err.response || null })
  }
}

export async function listTeamMembers(teamId) {
  try {
    const data = await request('GET', `/teams/${encodeURIComponent(teamId)}/members`)
    return Array.isArray(data) ? data : (data && data.members) || []
  } catch (err) {
    return Promise.reject({ message: err.message || 'Failed to list members', status: err.status || 500, data: err.response || null })
  }
}

export default {
  createTeam,
  getMyTeams,
  addMemberToTeam,
  createList,
  getLists,
  createTask,
  getTasks,
  updateTask,
  removeMemberFromTeam,
  listTeamMembers,
}
