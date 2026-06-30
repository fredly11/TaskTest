import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const initialTeams = [
  {
    id: 'team-alpha',
    name: 'Team Alpha',
    owner: 'jane.doe',
    members: ['jane.doe', 'alex.smith'],
    tasks: [
      {
        id: 'alpha-1',
        title: 'Define Q3 milestones',
        description: 'Capture the main goals and release items for the next quarter.',
        priority: 'High',
        assignedTo: 'alex.smith',
        completed: false,
      },
      {
        id: 'alpha-2',
        title: 'Review launch readiness',
        description: 'Validate documentation and deployment readiness.',
        priority: 'Medium',
        assignedTo: 'jane.doe',
        completed: true,
      },
    ],
  },
]

const priorityOptions = ['Low', 'Medium', 'High']

export default function Home() {
  const auth = useAuth()
  const currentUser = auth.user?.username || 'user'
  const [teams, setTeams] = useState(initialTeams)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamMember, setNewTeamMember] = useState('')
  const [newTaskTitles, setNewTaskTitles] = useState({})
  const [newTaskDescriptions, setNewTaskDescriptions] = useState({})
  const [newTaskPriorities, setNewTaskPriorities] = useState({})
  const [newTaskAssignees, setNewTaskAssignees] = useState({})
  const [teamError, setTeamError] = useState('')
  const [memberError, setMemberError] = useState('')

  const groupMembershipCounts = useMemo(() => {
    const counts = {}
    teams.forEach((team) => {
      team.members.forEach((member) => {
        counts[member] = (counts[member] || 0) + 1
      })
    })
    return counts
  }, [teams])

  const ownedTeamsCount = teams.filter((team) => team.owner === currentUser).length

  const createTeam = (event) => {
    event.preventDefault()
    setTeamError('')
    const name = newTeamName.trim()
    if (!name) {
      setTeamError('Team name is required.')
      return
    }

    if (ownedTeamsCount >= 3) {
      setTeamError('You can create up to 3 teams.')
      return
    }

    if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      setTeamError('A team with that name already exists.')
      return
    }

    const newTeam = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      owner: currentUser,
      members: [currentUser],
      tasks: [],
    }

    setTeams((current) => [newTeam, ...current])
    setNewTeamName('')
  }

  const addTeamMember = (teamId) => {
    setMemberError('')
    const username = newTeamMember.trim()
    if (!username) {
      setMemberError('Enter the username to add.')
      return
    }

    const team = teams.find((item) => item.id === teamId)
    if (!team || team.owner !== currentUser) {
      setMemberError('Only the team owner can add members.')
      return
    }

    if (team.members.includes(username)) {
      setMemberError('That user is already a member of the team.')
      return
    }

    const memberships = groupMembershipCounts[username] || 0
    if (memberships >= 5) {
      setMemberError('That user already belongs to 5 teams.')
      return
    }

    setTeams((current) =>
      current.map((item) =>
        item.id === teamId ? { ...item, members: [...item.members, username] } : item
      )
    )
    setNewTeamMember('')
  }

  const removeTeamMember = (teamId, username) => {
    setMemberError('')
    const team = teams.find((item) => item.id === teamId)
    if (!team || team.owner !== currentUser) {
      setMemberError('Only the team owner can remove members.')
      return
    }

    if (username === team.owner) {
      setMemberError('The team owner cannot be removed.')
      return
    }

    setTeams((current) =>
      current.map((item) =>
        item.id === teamId
          ? { ...item, members: item.members.filter((member) => member !== username) }
          : item
      )
    )
  }

  const addTask = (teamId) => {
    const title = (newTaskTitles[teamId] || '').trim()
    if (!title) return

    const description = newTaskDescriptions[teamId] || ''
    const priority = newTaskPriorities[teamId] || 'Medium'
    const assignedTo = newTaskAssignees[teamId] || currentUser

    setTeams((current) =>
      current.map((team) =>
        team.id === teamId
          ? {
              ...team,
              tasks: [
                ...team.tasks,
                {
                  id: `${teamId}-${Date.now()}`,
                  title,
                  description,
                  priority,
                  assignedTo,
                  completed: false,
                },
              ],
            }
          : team
      )
    )

    setNewTaskTitles((current) => ({ ...current, [teamId]: '' }))
    setNewTaskDescriptions((current) => ({ ...current, [teamId]: '' }))
    setNewTaskPriorities((current) => ({ ...current, [teamId]: 'Medium' }))
    setNewTaskAssignees((current) => ({ ...current, [teamId]: currentUser }))
  }

  const toggleTask = (teamId, taskId) => {
    setTeams((current) =>
      current.map((team) =>
        team.id === teamId
          ? {
              ...team,
              tasks: team.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : team
      )
    )
  }

  if (auth.isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <div className="dashboard-header">
            <h1>Welcome back, {currentUser}</h1>
            <p>Manage your teams and shared task lists.</p>
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
                <button type="submit" className="btn primary">
                  Create team
                </button>
              </div>
            </form>
            <p className="muted">Team owners can create up to 3 teams. Members can belong to up to 5 teams.</p>
          </div>

          <div className="team-lists">
            {teams.map((team) => (
              <div key={team.id} className="team-card">
                <div className="team-header">
                  <div>
                    <h2>{team.name}</h2>
                    <p className="muted">Owner: {team.owner}</p>
                  </div>
                  <span className="team-label">{team.members.length} members</span>
                </div>

                <div className="team-members">
                  <h3>Members</h3>
                  {team.members.map((member) => (
                    <div key={member} className="team-member">
                      <span>{member}</span>
                      {team.owner === currentUser && member !== team.owner ? (
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() => removeTeamMember(team.id, member)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {team.owner === currentUser && (
                  <div className="team-member-add">
                    <input
                      className="input"
                      value={newTeamMember}
                      onChange={(e) => setNewTeamMember(e.target.value)}
                      placeholder="Add member by username"
                    />
                    <button type="button" className="btn secondary" onClick={() => addTeamMember(team.id)}>
                      Add member
                    </button>
                  </div>
                )}
                {memberError && <div className="message error">{memberError}</div>}

                <div className="task-creation-card card card-form">
                  <h3>Create task for {team.name}</h3>
                  <div className="field">
                    <label>Task title</label>
                    <input
                      className="input"
                      value={newTaskTitles[team.id] || ''}
                      onChange={(e) => setNewTaskTitles((current) => ({ ...current, [team.id]: e.target.value }))}
                      placeholder="Task title"
                    />
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <input
                      className="input"
                      value={newTaskDescriptions[team.id] || ''}
                      onChange={(e) => setNewTaskDescriptions((current) => ({ ...current, [team.id]: e.target.value }))}
                      placeholder="Task description"
                    />
                  </div>

                  <div className="task-add-row-grid">
                    <div className="field">
                      <label>Priority</label>
                      <select
                        className="input"
                        value={newTaskPriorities[team.id] || 'Medium'}
                        onChange={(e) => setNewTaskPriorities((current) => ({ ...current, [team.id]: e.target.value }))}
                      >
                        {priorityOptions.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Assigned member</label>
                      <select
                        className="input"
                        value={newTaskAssignees[team.id] || currentUser}
                        onChange={(e) => setNewTaskAssignees((current) => ({ ...current, [team.id]: e.target.value }))}
                      >
                        {team.members.map((member) => (
                          <option key={member} value={member}>
                            {member}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <button type="button" className="btn primary" onClick={() => addTask(team.id)}>
                      Create task
                    </button>
                  </div>
                </div>

                <ul className="task-items">
                  {team.tasks.map((task) => (
                    <li key={task.id} className={task.completed ? 'task-item completed' : 'task-item'}>
                      <button type="button" className="task-toggle" onClick={() => toggleTask(team.id, task.id)}>
                        {task.completed ? '☑' : '☐'}
                      </button>
                      <div className="task-meta">
                        <strong>{task.title}</strong>
                        <p>{task.description}</p>
                      </div>
                      <div className="task-pill-wrap">
                        <span className={`task-pill priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                        <span className="task-pill assigned">{task.assignedTo}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="dashboard-actions">
            <Link className="btn primary" to="/features">View features</Link>
            <button className="btn" type="button" onClick={auth.signOut}>Sign out</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero">
      <div className="container">
        <h1>Simple task management for teams</h1>
        <p>Organize, prioritize, and deliver — fast. Built for cross-functional teams.</p>
        <div className="cta-row">
          <Link className="btn primary" to="/signup">Get Started</Link>
          <Link className="btn" to="/features">See Features</Link>
        </div>
      </div>
    </section>
  )
}
