import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GiChessKnight } from 'react-icons/gi'
import './Header.css'

function Header() {
  const [isLoggedIn] = useState(false)
  
  const handleLoginClick = () => {
    console.log('Login button clicked')
  }
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <GiChessKnight className="me-2" size={24} />
          <span>ChessPlatform</span>
        </Link>
        
        <div className="ms-auto">
          {!isLoggedIn && (
            <button 
              className="btn btn-outline-light"
              onClick={handleLoginClick}
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Header