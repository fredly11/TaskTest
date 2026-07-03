import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function CreateListForm({ onListCreated }) {
  const auth = useAuth()
  const [listName, setListName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [teamsLoading, setTeamsLoading] = useState(false)

  // Fetch teams on mount
  useEffect(() => {
    if (!auth.isAuthenticated) return
    
    async function loadTeams() {
      setTeamsLoading(true)
      try {
        const data = await api.getMyTeams()
        setTeams(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load teams:', err)
        // Teams are optional, so don't block the form
        setTeams([])
      } finally {
        setTeamsLoading(false)
      }
    }
    
    loadTeams()
  }, [auth.isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const name = listName.trim()
    if (!name) {
      setError('List name is required.')
      return
    }

    try {
      setLoading(true)
      
      // If no team selected, pass null for personal list
      const teamId = selectedTeamId || null
      const tenantId = auth.user?.id || auth.user?.username
      const response = await api.createList(name, teamId, tenantId)
      
      setListName('')
      setSelectedTeamId('')
      
      const message = response?.message || `Created list "${name}" successfully.`
      setSuccess(message)
      
      // Call callback to refresh lists if provided
      if (onListCreated) {
        await onListCreated({
          listId: response?.listId,
          name,
          teamId: response?.teamId,
        })
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to create list:', err)
      setError(err?.response?.message || err?.message || 'Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-list-form card card-form">
      <h2>Create a new list</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="list-name">List name</label>
          <input
            id="list-name"
            className="input"
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder="Enter list name"
            disabled={loading}
          />
        </div>

        <div className="field">
          <label htmlFor="team-select">Team (optional)</label>
          <select
            id="team-select"
            className="input"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={loading || teamsLoading}
            style={{
              backgroundColor: '#1a3a52',
              color: '#fff',
            }}
          >
            <option value="">Personal list</option>
            {teams.map((team) => (
              <option key={team.teamId} value={team.teamId}>
                {team.name}
              </option>
            ))}
          </select>
          <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            {selectedTeamId 
              ? `Team list - members can view and edit` 
              : `Personal list - only you can view and edit`}
          </p>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <div className="field">
          <button
            type="submit"
            className="btn primary"
            disabled={loading || teamsLoading || !listName.trim()}
          >
            {loading ? 'Creating...' : 'Create list'}
          </button>
        </div>
      </form>
    </div>
  )
}
