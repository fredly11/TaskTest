import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

function uniqueByListId(items) {
  const seen = new Map()
  items.forEach((item) => {
    if (item?.listId && !seen.has(item.listId)) {
      seen.set(item.listId, item)
    }
  })
  return Array.from(seen.values())
}

export default function ListDetail() {
  const auth = useAuth()
  const { listId: encodedListId } = useParams()
  const listId = useMemo(() => decodeURIComponent(encodedListId || ''), [encodedListId])
  const currentTenantId = auth.user?.id || auth.user?.username || null
  const [list, setList] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('Medium')
  const [taskError, setTaskError] = useState('')
  const [taskLoading, setTaskLoading] = useState(false)

  const tenantCandidates = useMemo(() =>
    Array.from(new Set([
      auth.user?.id,
      auth.user?.username,
      auth.user?.email,
      auth.user?.raw?.sub,
      auth.user?.raw?.['cognito:username'],
    ].filter(Boolean))),
    [auth.user]
  )

  const fetchTasksForCurrentViewer = async (teamId) => {
    const isTeamList = !!teamId

    if (!isTeamList) {
      for (const tenantCandidate of tenantCandidates) {
        const items = await api.getTasks(listId, undefined, tenantCandidate).catch(() => [])
        if (Array.isArray(items) && items.length > 0) {
          return items
        }
      }
      return api.getTasks(listId).catch(() => [])
    }

    const strategies = [
      () => api.getTasks(listId, teamId, teamId),
      () => api.getTasks(listId, teamId, currentTenantId),
      () => api.getTasks(listId, undefined, teamId),
      () => api.getTasks(listId, teamId),
    ]

    for (const run of strategies) {
      const items = await run().catch(() => [])
      if (Array.isArray(items) && items.length > 0) {
        return items
      }
    }

    return []
  }

  useEffect(() => {
    if (!auth.isAuthenticated || !listId) return
    const mounted = { current: true }

    async function loadAll() {
      setLoading(true)
      setError('')
      try {
        const teams = await api.getMyTeams().catch(() => [])

        const personalResults = []
        for (const candidate of tenantCandidates) {
          const data = await api.getLists(undefined, candidate).catch(() => [])
          if (Array.isArray(data) && data.length > 0) personalResults.push(...data)
        }

        const teamResults = []
        for (const team of Array.isArray(teams) ? teams : []) {
          for (const run of [
            () => api.getLists(team.teamId, team.teamId),
            () => api.getLists(team.teamId, currentTenantId),
            () => api.getLists(undefined, team.teamId),
          ]) {
            const data = await run().catch(() => [])
            if (Array.isArray(data) && data.length > 0) { teamResults.push(...data); break }
          }
        }

        const allLists = uniqueByListId([...personalResults, ...teamResults])
        const matched = allLists.find((item) => item.listId === listId) || null
        if (!mounted.current) return

        if (!matched) {
          setError('List not found.')
          return
        }

        setList(matched)

        const tasksData = await fetchTasksForCurrentViewer(matched.teamId)
        if (!mounted.current) return
        setTasks(Array.isArray(tasksData) ? tasksData : [])
      } catch (err) {
        if (mounted.current) setError(err?.message || 'Failed to load list')
      } finally {
        if (mounted.current) setLoading(false)
      }
    }

    loadAll()
    return () => { mounted.current = false }
  }, [auth.isAuthenticated, listId, currentTenantId])

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editFields, setEditFields] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  const startEdit = (task) => {
    setEditingTaskId(task.taskId || task.id)
    setEditFields({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      status: task.status || '',
      assignedTo: task.assignedTo || '',
    })
    setEditError('')
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditFields({})
    setEditError('')
  }

  const handleSaveEdit = async (task) => {
    const taskId = task.taskId || task.id
    setEditLoading(true)
    setEditError('')
    try {
      const effectiveTenantId = list?.teamId || currentTenantId
      const updates = {
        ...editFields,
        listId,
        taskId,
        tenantId: effectiveTenantId,
      }
      if (list?.teamId) updates.teamId = list.teamId
      await api.updateTask(listId, taskId, updates)
      setEditingTaskId(null)
      await refreshTasks(list?.teamId)
    } catch (err) {
      setEditError(err?.response?.error || err?.response?.message || err?.message || 'Failed to update task')
    } finally {
      setEditLoading(false)
    }
  }

  const refreshTasks = async (teamId) => {
    console.log('[ListDetail.refreshTasks] input:', { listId, teamId: teamId || null, listTeamId: list?.teamId || null })
    const tasksData = await fetchTasksForCurrentViewer(teamId)
    console.log('[ListDetail.refreshTasks] result:', { count: Array.isArray(tasksData) ? tasksData.length : 0, tasksData })
    setTasks(Array.isArray(tasksData) ? tasksData : [])
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    const title = newTaskTitle.trim()
    if (!title) { setTaskError('Task title is required.'); return }
    setTaskError('')
    setTaskLoading(true)
    try {
      const body = {
        listId,
        title,
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
      }
      if (list?.teamId) body.teamId = list.teamId
      await api.createTask(listId, body)
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('Medium')
      await refreshTasks(list?.teamId)
    } catch (err) {
      setTaskError(err?.response?.message || err?.message || 'Failed to create task')
    } finally {
      setTaskLoading(false)
    }
  }

  if (!auth.isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <p>Please log in to view this list.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="dashboard-header">
          <h1>{list?.name || 'List details'}</h1>
          <p>{list?.teamId ? 'Team list' : 'Personal list'}</p>
        </div>

        <div className="dashboard-actions">
          <Link className="btn" to="/lists">← Back to lists</Link>
        </div>

        {loading ? (
          <div className="message">Loading…</div>
        ) : error ? (
          <div className="message error">{error}</div>
        ) : (
          <>
            <div className="task-creation-card card card-form">
              <h3>Add a task</h3>
              <form onSubmit={handleAddTask}>
                <div className="field">
                  <label>Title</label>
                  <input
                    className="input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title"
                    disabled={taskLoading}
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <input
                    className="input"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Optional description"
                    disabled={taskLoading}
                  />
                </div>
                <div className="field">
                  <label>Priority</label>
                  <select
                    className="input"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    disabled={taskLoading}
                    style={{ backgroundColor: '#1a3a52', color: '#fff' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {taskError && <div className="message error">{taskError}</div>}
                <div className="field">
                  <button type="submit" className="btn primary" disabled={taskLoading || !newTaskTitle.trim()}>
                    {taskLoading ? 'Adding…' : 'Add task'}
                  </button>
                </div>
              </form>
            </div>

            <div className="team-lists">
              {tasks.length === 0 ? (
                <div className="message">No tasks yet. Add one above.</div>
              ) : (
                <ul className="task-items">
                  {tasks.map((task) => {
                    const taskId = task.taskId || task.id
                    const isEditing = editingTaskId === taskId

                    return (
                      <li key={taskId} className={task.completed ? 'task-item completed' : 'task-item'}>
                        {isEditing ? (
                          <div className="task-edit-form" style={{ flex: 1 }}>
                            <div className="field">
                              <label>Title</label>
                              <input
                                className="input"
                                value={editFields.title}
                                onChange={(e) => setEditFields((f) => ({ ...f, title: e.target.value }))}
                                disabled={editLoading}
                              />
                            </div>
                            <div className="field">
                              <label>Description</label>
                              <input
                                className="input"
                                value={editFields.description}
                                onChange={(e) => setEditFields((f) => ({ ...f, description: e.target.value }))}
                                disabled={editLoading}
                              />
                            </div>
                            <div className="field">
                              <label>Priority</label>
                              <select
                                className="input"
                                value={editFields.priority}
                                onChange={(e) => setEditFields((f) => ({ ...f, priority: e.target.value }))}
                                disabled={editLoading}
                                style={{ backgroundColor: '#1a3a52', color: '#fff' }}
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div className="field">
                              <label>Assigned to</label>
                              <input
                                className="input"
                                value={editFields.assignedTo}
                                onChange={(e) => setEditFields((f) => ({ ...f, assignedTo: e.target.value }))}
                                disabled={editLoading}
                                placeholder="Username"
                              />
                            </div>
                            <div className="field">
                              <label>Status</label>
                              <select
                                className="input"
                                value={editFields.status}
                                onChange={(e) => setEditFields((f) => ({ ...f, status: e.target.value }))}
                                disabled={editLoading}
                                style={{ backgroundColor: '#1a3a52', color: '#fff' }}
                              >
                                <option value="">—</option>
                                <option value="todo">To do</option>
                                <option value="in_progress">In progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            {editError && <div className="message error">{editError}</div>}
                            <div className="field" style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="btn primary" onClick={() => handleSaveEdit(task)} disabled={editLoading || !editFields.title.trim()}>
                                {editLoading ? 'Saving…' : 'Save'}
                              </button>
                              <button className="btn" onClick={cancelEdit} disabled={editLoading}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="task-meta">
                              <strong>{task.title || 'Untitled task'}</strong>
                              {task.description ? <p>{task.description}</p> : null}
                              {task.status ? <p className="muted">Status: {task.status}</p> : null}
                              {task.assignedTo ? <p className="muted">Assigned to: {task.assignedTo}</p> : null}
                              {task.createdAt ? <p className="muted">Created: {new Date(task.createdAt).toLocaleDateString()}</p> : null}
                            </div>
                            <div className="task-pill-wrap">
                              {task.priority && (
                                <span className={`task-pill priority-${String(task.priority).toLowerCase()}`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.status && (
                                <span className="task-pill assigned">{task.status}</span>
                              )}
                              <button className="btn secondary" style={{ marginLeft: '0.5rem' }} onClick={() => startEdit(task)}>
                                Edit
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
