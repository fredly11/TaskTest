import React from 'react'

export default function Pricing(){
  return (
    <section className="section">
      <div className="container">
        <h2>Pricing</h2>
        <div className="pricing-grid">
          <div className="card">
            <h3>Starter</h3>
            <p>$0 / mo — up to 5 users</p>
          </div>
          <div className="card">
            <h3>Team</h3>
            <p>$8 / user / mo — collaboration features</p>
          </div>
          <div className="card">
            <h3>Enterprise</h3>
            <p>Contact us — advanced security & support</p>
          </div>
        </div>
      </div>
    </section>
  )
}
