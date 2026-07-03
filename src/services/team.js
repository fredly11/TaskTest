import api from './api'

export async function getTeams() {
  return api.request('/teams')
}

export async function createTeam(name) {
  return api.request('/teams', { method: 'POST', body: { name } })
}

export async function addMember(teamId, username) {
  return api.request(`/teams/${encodeURIComponent(teamId)}/members`, {
    method: 'POST',
    body: { username },
  })
}

export async function removeMember(teamId, username) {
  return api.request(`/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  })
}

export async function createTask(teamId, task) {
  return api.request(`/teams/${encodeURIComponent(teamId)}/tasks`, {
    method: 'POST',
    body: task,
  })
}

export async function toggleTask(teamId, taskId) {
  return api.request(`/teams/${encodeURIComponent(teamId)}/tasks/${encodeURIComponent(taskId)}/toggle`, {
    method: 'POST',
  })
}

export default { getTeams, createTeam, addMember, removeMember, createTask, toggleTask }
