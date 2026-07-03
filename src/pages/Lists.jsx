import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CreateListForm from '../components/CreateListForm'
import api from '../services/api'

export default function Lists() {
  const auth = useAuth()
  const currentTenantId = auth.user?.id || auth.user?.username || null
  const [teams, setTeams] = useState([])
  const [lists, setLists] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const mergeUniqueLists = (items) => {
    const seen = new Map()
    items.forEach((list) => {
      if (list?.listId && !seen.has(list.listId)) {
        seen.set(list.listId, list)
      }
    })
    return Array.from(seen.values())
  }

  const fetchListsForSelection = async (teamId = selectedTeamId) => {
    const isPersonal = teamId === 'personal'

    if (isPersonal) {
      const tenantCandidates = Array.from(
        new Set(
          [
            auth.user?.id,
            auth.user?.username,
            auth.user?.email,
            auth.user?.raw?.sub,
            auth.user?.raw?.['cognito:username'],
          ].filter(Boolean)
        )
      )

      const results = []
      for (const tenantCandidate of tenantCandidates) {
        const listsData = await api.getLists(undefined, tenantCandidate)
        if (Array.isArray(listsData) && listsData.length > 0) {
          results.push(...listsData)
        }
      }

      return mergeUniqueLists(results)
    }

    const strategies = [
      () => api.getLists(teamId, teamId),
      () => api.getLists(teamId, currentTenantId),
      () => api.getLists(undefined, teamId),
    ]

    for (const runStrategy of strategies) {
      const listsData = await runStrategy()
      if (Array.isArray(listsData) && listsData.length > 0) {
        return listsData
      }
    }

    return []
  }

  const refreshLists = async (teamId = selectedTeamId) => {
    const listsData = await fetchListsForSelection(teamId)
    setLists(Array.isArray(listsData) ? listsData : [])
  }

  useEffect(() => {
    if (!auth.isAuthenticated) return

    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const teamsData = await api.getMyTeams()
        if (!mounted) return
        setTeams(Array.isArray(teamsData) ? teamsData : [])
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load lists')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [auth.isAuthenticated])

  useEffect(() => {
    if (!auth.isAuthenticated) return

    let mounted = true

    async function loadListsForSelection() {
      setLoading(true)
      setError('')
      try {
        const listsData = await fetchListsForSelection(selectedTeamId)
        if (!mounted) return
        setLists(Array.isArray(listsData) ? listsData : [])
      } catch (err) {
        if (mounted) {
          setError(err?.message || 'Failed to load lists')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadListsForSelection()

    return () => {
      mounted = false
    }
  }, [auth.isAuthenticated, selectedTeamId, currentTenantId])

  const handleListCreated = async () => {
    setError('')
    try {
      await refreshLists()
    } catch (err) {
      setError(err?.message || 'Failed to refresh lists')
    }
  }

  // Filter lists based on selected team
  const filteredLists = lists.filter((list) => {
    if (selectedTeamId === 'personal') {
      return !list.teamId
    }
    return list.teamId === selectedTeamId
  })

  if (!auth.isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <p>Please log in to view your lists.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="dashboard-header">
          <h1>Your Lists</h1>
          <p>Organize your tasks with personal or team lists.</p>
        </div>

        <CreateListForm onListCreated={handleListCreated} />

        <div className="lists-management">
          <div className="list-filter">
            <h2>Filter by</h2>
            <select
              className="input"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              style={{
                backgroundColor: '#1a3a52',
                color: '#fff',
              }}
            >
              <option value="personal">Personal lists</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lists-display">
            {loading ? (
              <div className="message">Loading lists…</div>
            ) : error ? (
              <div className="message error">{error}</div>
            ) : filteredLists.length === 0 ? (
              <div className="message">
                No {selectedTeamId === 'personal' ? 'personal' : 'team'} lists yet. Create one above to get started.
              </div>
            ) : (
              <div className="lists-grid">
                {filteredLists.map((list) => (
                  <div key={list.listId} className="list-card card">
                    <h3>{list.name}</h3>
                    <p className="muted">
                      {selectedTeamId === 'personal' ? 'Personal list' : `Team list`}
                    </p>
                    <Link className="btn secondary" to={`/lists/${encodeURIComponent(list.listId)}`}>
                      View list
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-actions">
          <Link className="btn" to="/">Back to teams</Link>
        </div>
      </div>
    </section>
  )
}
