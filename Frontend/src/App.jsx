import { useState } from 'react'
import Login from './pages/login'
import Alert from './pages/alert'
import Home from './pages/home'
import Navbar from './components/navbar'
import { useEffect } from 'react'
import Rule from './pages/rule'
import { Routes } from 'react-router-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import { useSelector } from 'react-redux'

function App() {
  const user = useSelector((state) => state.user)
  return (
    <>
      <Router>
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          {user && (
            <>
              <Route path="/alerts" element={<Alert />} />
              <Route path="/rules" element={<Rule />} />
            </>
          )}
          <Route path="*" element={<h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Oops! Page Not Found
          </h2>} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
