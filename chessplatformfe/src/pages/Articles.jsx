import { FaChessBoard } from 'react-icons/fa'

function Articles() {
  return (
    <div className="text-center py-4">
      <h1>Chess Articles</h1>
      
      <div className="mt-5">
        <FaChessBoard size={48} className="text-muted mb-3" />
        <h3>No Articles Yet</h3>
        <p className="text-muted">
          Stay tuned for interesting articles about chess strategies, player profiles, and tournament reviews.
        </p>
      </div>
    </div>
  )
}

export default Articles