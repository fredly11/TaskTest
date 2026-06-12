import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">TaskSaaS</Link>
        <nav>
          <NavLink to="/features" className={({isActive})=> isActive? 'active':''}>Features</NavLink>
          <NavLink to="/pricing" className={({isActive})=> isActive? 'active':''}>Pricing</NavLink>
          <NavLink to="/contact" className={({isActive})=> isActive? 'active':''}>Contact</NavLink>
          <NavLink to="/signup" className={({isActive})=> isActive? 'active':''}>Sign up</NavLink>
        </nav>
      </div>
    </header>
  )
}
