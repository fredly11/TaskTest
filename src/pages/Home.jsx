import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const auth = useAuth()
  if (auth.isAuthenticated) {
    return (
      <section className="section">
        <div className="container">
          <div className="dashboard-header">
            <h1>Welcome back, {auth.user?.username || 'there'}</h1>
            <p>Choose a workspace area to manage your teams or focus on lists.</p>
          </div>

          <div className="team-lists">
            <div className="team-card">
              <div className="team-header">
                <div>
                  <h2>Team management</h2>
                  <p className="muted">Create teams, invite members, and manage ownership in one place.</p>
                </div>
              </div>
              <Link className="btn primary" to="/teams">Open teams</Link>
            </div>

            <div className="team-card">
              <div className="team-header">
                <div>
                  <h2>Lists</h2>
                  <p className="muted">Switch between personal lists and team lists from a dedicated page.</p>
                </div>
              </div>
              <Link className="btn primary" to="/lists">Open lists</Link>
            </div>
          </div>

          <div className="dashboard-actions">
            <Link className="btn primary" to="/teams">Manage teams</Link>
            <Link className="btn" to="/lists">Browse lists</Link>
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
