import { FaNewspaper } from 'react-icons/fa'

function News() {
  return (
    <div className="text-center py-4">
      <h1>Official Chess News</h1>
      
      <div className="mt-5">
        <FaNewspaper size={48} className="text-muted mb-3" />
        <h3>No News Yet</h3>
        <p className="text-muted">
          Check back later for official announcements, tournament schedules, and important updates from the chess world.
        </p>
      </div>
    </div>
  )
}

export default News