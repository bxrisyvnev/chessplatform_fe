import { GiChessKnight, GiChessQueen, GiChessPawn } from 'react-icons/gi'
import { FaVideo } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../services/auth'
import { useNavigate } from 'react-router-dom'

function Sidebar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const isAdmin = user?.roles?.includes('Admin');

  return (
      <div className="bg-light border-end h-100 p-3">
        <nav>
          <div className="list-group">
            <button className="list-group-item list-group-item-action d-flex align-items-center">
              <GiChessKnight className="me-3" size={20}/>
              <span>Play</span>
            </button>

            <button
                className="list-group-item list-group-item-action d-flex align-items-center"
                onClick={() => navigate('/post')}
            >
              <GiChessQueen className="me-3" size={20}/>
              <span>Post</span>
            </button>
            <button
                className="list-group-item list-group-item-action d-flex align-items-center"
                onClick={() => navigate('/start-stream')}
            >
              <FaVideo className="me-3" size={20}/>
              <span>Start Stream</span>
            </button>
            {isAdmin && (
                <button className="list-group-item list-group-item-action d-flex align-items-center text-danger">
                  🛠 Edit Users
                </button>
            )}
          </div>
        </nav>

        <div className="mt-auto pt-3 border-top text-center text-muted small">
          <GiChessPawn className="me-1"/>
          <span>© 2025 ChessPlatform</span>
        </div>
      </div>
  )
}

export default Sidebar
