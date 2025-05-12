import { GiChessKnight, GiChessQueen, GiChessPawn } from 'react-icons/gi'
import { FaEye } from 'react-icons/fa'

function Sidebar() {
  return (
    <div className="bg-light border-end h-100 p-3">
      <nav>
        <div className="list-group">
          <button className="list-group-item list-group-item-action d-flex align-items-center">
            <GiChessKnight className="me-3" size={20} />
            <span>Play</span>
          </button>
          <button className="list-group-item list-group-item-action d-flex align-items-center">
            <FaEye className="me-3" size={20} />
            <span>Spectate</span>
          </button>
          <button className="list-group-item list-group-item-action d-flex align-items-center">
            <GiChessQueen className="me-3" size={20} />
            <span>Post</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar