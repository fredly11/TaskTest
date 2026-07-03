import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const auth = useAuth()

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">TaskSaaS</Link>
        <nav>
          <NavLink to="/features" className={({isActive})=> isActive? 'active':''}>Features</NavLink>
          <NavLink to="/pricing" className={({isActive})=> isActive? 'active':''}>Pricing</NavLink>
          <NavLink to="/contact" className={({isActive})=> isActive? 'active':''}>Contact</NavLink>
          {auth.isAuthenticated ? (
            <>
              <NavLink to="/teams" className={({isActive})=> isActive? 'active':''}>Teams</NavLink>
              <NavLink to="/lists" className={({isActive})=> isActive? 'active':''}>Lists</NavLink>
              <span className="navbar-user">Signed in as {auth.user.username}</span>
              <button type="button" className="btn-link" onClick={auth.signOut}>Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/signin" className={({isActive})=> isActive? 'active':''}>Sign in</NavLink>
              <NavLink to="/signup" className={({isActive})=> isActive? 'active':''}>Sign up</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
