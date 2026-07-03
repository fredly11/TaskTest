import React from 'react'

export default function Loading({ message = 'Loading...' }) {
  return (
    <div style={{padding:20, textAlign:'center'}}>
      <div className="spinner" style={{margin:'0 auto 8px',width:36,height:36,borderRadius:999,border:'4px solid rgba(255,255,255,0.08)',borderTopColor:'var(--accent)',animation:'spin 1s linear infinite'}} />
      <div style={{color:'var(--muted)'}}>{message}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
