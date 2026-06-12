import React from 'react'

export default function Home(){
  return (
    <section className="hero">
      <div className="container">
        <h1>Simple task management for teams</h1>
        <p>Organize, prioritize, and deliver — fast. Built for cross-functional teams.</p>
        <div className="cta-row">
          <a className="btn primary" href="/pricing">Get Started</a>
          <a className="btn" href="/features">See Features</a>
        </div>
      </div>
    </section>
  )
}
