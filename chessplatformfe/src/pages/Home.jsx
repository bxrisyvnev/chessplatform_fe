import { Link } from 'react-router-dom'
import { GiChessKing, GiChessQueen } from 'react-icons/gi'

function Home() {
  return (
    <div className="text-center py-5">
      <div className="d-flex justify-content-center align-items-center mb-4">
        <GiChessKing size={40} className="me-3" />
        <h1>Welcome to ChessPlatform</h1>
        <GiChessQueen size={40} className="ms-3" />
      </div>
      
      <p className="lead mb-4">
        The social media platform for chess enthusiasts.
        Connect with players, share games, and stay updated with chess news.
      </p>
      
      <div className="d-flex justify-content-center gap-3 mb-5">
        <Link to="/articles" className="btn btn-primary">
          Browse Articles
        </Link>
        <Link to="/news" className="btn btn-secondary">
          Latest News
        </Link>
      </div>
      
      <div className="card mt-5">
        <div className="card-body">
          <h2>Getting Started</h2>
          <p className="mb-0">
            Explore articles and news from the chess community.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home