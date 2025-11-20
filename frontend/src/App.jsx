import {BrowserRouter as Route, Router, Routes } from "react-router-dom"
import React from 'react'
import Home from "./pages/Home.jsx"


const App = () => {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<Home/>} />
    </Routes>
  </Router>
  )
}

export default App