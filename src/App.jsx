import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Teams from './pages/Teams'
import Lists from './pages/Lists'
import ListDetail from './pages/ListDetail'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Callback from './pages/Callback'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:listId" element={<ListDetail />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
