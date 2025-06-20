import { Link, useNavigate } from 'react-router-dom';
import { GiChessKnight } from 'react-icons/gi';
import { isAuthenticated, logout, getCurrentUser } from '../../services/auth';

function Header() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    window.location.href = '/';
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <GiChessKnight className="me-2" size={24} />
            <span>ChessPlatform</span>
          </Link>

          <div className="ms-auto d-flex align-items-center">
            {!isAuthenticated() ? (
                <>
                  <button
                      className="btn btn-outline-light me-2"
                      onClick={handleLoginClick}
                  >
                    Log In
                  </button>
                  <button
                      className="btn btn-outline-light"
                      onClick={handleRegisterClick}
                  >
                    Register
                  </button>
                </>
            ) : (
                <>
                  <Link to="/profile" className="btn btn-outline-light me-3">
                    {user.username}
                  </Link>
                  <button
                      className="btn btn-outline-light"
                      onClick={handleLogoutClick}
                  >
                    Log Out
                  </button>
                </>
            )}
          </div>
        </div>
      </nav>
  );
}

export default Header;