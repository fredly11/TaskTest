import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Teams() {
  const auth = useAuth()
  const currentUserId = auth.user?.id || auth.user?.username || 'user'
  const currentUsername = auth.user?.username || auth.user?.id || 'user'
  const [teams, setTeams] = useState([])
  const [newTeamName, setNewTeamName] = useState('')
  const [newMemberInputs, setNewMemberInputs] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [teamError, setTeamError] = useState('')
  const [memberError, setMemberError] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  const isTeamOwner = (team) => {
    const ownerIds = [team.owner, team.ownerId, team.ownerUserId]
    return ownerIds.some((id) => id && (id === currentUserId || id === currentUsername))
  }

  const ownedTeamsCount = useMemo(
    () => (Array.isArray(teams) ? teams.filter((team) => isTeamOwner(team)).length : 0),
    [teams, currentUserId, currentUsername]
  )

  useEffect(() => {
    if (!auth.isAuthenticated) return
    let mounted = true

    async function loadTeams() {
      setLoading(true)
      setFetchError('')
      try {
        const data = await api.getMyTeams()
        if (!mounted) return
        setTeams(Array.isArray(data) ? data : [])
      } catch (err) {
        if (mounted) {
          setFetchError(err?.message || 'Unable to load teams')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadTeams()
    return () => {
      mounted = false
    }
  }, [auth.isAuthenticated])

  const createTeam = async (event) => {
    event.preventDefault()
    setTeamError('')
    setActionMessage('')
    const name = newTeamName.trim()

    if (!name) {
      setTeamError('Team name is required.')
      return
    }

    if (ownedTeamsCount >= 3) {
      setTeamError('You can create up to 3 teams.')
      return
    }

    if (Array.isArray(teams) && teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      setTeamError('A team with that name already exists.')
      return
    }

    try {
      setLoading(true)
      const response = await api.createTeam(name)

      const teamToAdd = response && typeof response === 'object'
        ? response
        : {
            teamId: `team_${Date.now()}`,
            name,
            owner: currentUsername,
            ownerUserId: currentUserId,
            members: [currentUsername],
          }

      setTeams((current) => [teamToAdd, ...current])
      setNewTeamName('')
      setActionMessage(`Created team "${teamToAdd.name}" successfully.`)
    } catch (err) {
      setTeamError(err?.message || 'Failed to create team')
    } finally {
      setLoading(false)
    }
  }

  const addTeamMember = async (teamId) => {
    setMemberError('')
    setActionMessage('')
    const username = (newMemberInputs[teamId] || '').trim()

    if (!username) {
      setMemberError('Enter the username to add.')
      return
    }

    try {
      await api.addMemberToTeam(teamId, username)
      setTeams((current) =>
        current.map((item) =>
          item.teamId === teamId ? { ...item, members: [...(item.members || []), username] } : item
        )
      )
      setNewMemberInputs((cur) => ({ ...cur, [teamId]: '' }))
      setActionMessage(`Added ${username} to the team.`)
    } catch (err) {
      setMemberError(err?.response?.error || err?.response?.message || err?.message || 'Failed to add member')
    }
  }

  const removeTeamMember = async (teamId, username) => {
    setMemberError('')
    setActionMessage('')
    const team = teams.find((item) => item.teamId === teamId)

    if (!team || !isTeamOwner(team)) {
      setMemberError('Only the team owner can remove members.')
      return
    }

    if (username === team.owner || username === team.ownerUserId || username === team.ownerId) {
      setMemberError('The team owner cannot be removed.')
      return
    }

    try {
      await api.removeMemberFromTeam(teamId, username)
      setTeams((current) =>
        current.map((item) =>
          item.teamId === teamId
            ? { ...item, members: (item.members || []).filter((member) => member !== username) }
            : item
        )
      )
      setActionMessage(`Removed ${username} from the team.`)
    } catch (err) {
      setMemberError(err?.message || 'Failed to remove member')
    }
  }

  if (!auth.isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <p>Please log in to manage your teams.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="dashboard-header">
          <h1>Team Management</h1>
          <p>Create teams, manage members, and keep ownership organized.</p>
        </div>

        <div className="team-creation-card card card-form">
          <h2>Create a new team</h2>
          <form className="form" onSubmit={createTeam}>
            <div className="field">
              <label>Team name</label>
              <input
                className="input"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="New team name"
              />
            </div>
            {teamError && <div className="message error">{teamError}</div>}
            <div className="field">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create team'}
              </button>
            </div>
          </form>
          <p className="muted">Team owners can create up to 3 teams. Members can belong to up to 5 teams.</p>
        </div>

        <div className="dashboard-actions">
          <Link className="btn primary" to="/lists">Go to lists</Link>
        </div>

        <div className="team-lists">
          {loading ? (
            <div className="message">Loading teams…</div>
          ) : fetchError ? (
            <div className="message error">{fetchError}</div>
          ) : teams.length === 0 ? (
            <div className="message">No teams yet. Create one to get started.</div>
          ) : teams.map((team) => (
            <div key={team.teamId} className="team-card">
              <div className="team-header">
                <div>
                  <h2>{team.name}</h2>
                  <p className="muted">Owner: {team.owner || team.ownerUserId || team.ownerId || 'Unknown'}</p>
                  {team.createdAt ? <p className="muted">Created: {new Date(team.createdAt).toLocaleDateString()}</p> : null}
                </div>
                <span className="team-label">{(team.members || []).length} members</span>
              </div>

              <div className="team-members">
                <h3>Members</h3>
                {(team.members || []).map((member) => (
                  <div key={member} className="team-member">
                    <span>{member}</span>
                    {isTeamOwner(team) && member !== team.owner && member !== team.ownerUserId && member !== team.ownerId ? (
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => removeTeamMember(team.teamId, member)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              {isTeamOwner(team) && (
                <div className="team-member-add">
                  <input
                    className="input"
                    value={newMemberInputs[team.teamId] || ''}
                    onChange={(e) => setNewMemberInputs((cur) => ({ ...cur, [team.teamId]: e.target.value }))}
                    placeholder="Add member by username"
                  />
                  <button type="button" className="btn secondary" onClick={() => addTeamMember(team.teamId)}>
                    Add member
                  </button>
                </div>
              )}

              {memberError && <div className="message error">{memberError}</div>}
              {actionMessage && <div className="message success">{actionMessage}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}