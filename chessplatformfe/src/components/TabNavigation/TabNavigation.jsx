import { NavLink } from 'react-router-dom'

function TabNavigation() {
  return (
    <ul className="nav nav-tabs mb-4">
      <li className="nav-item">
        <NavLink 
          to="/articles" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          Articles
        </NavLink>
      </li>
      <li className="nav-item">
        <NavLink 
          to="/news" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          Official News
        </NavLink>
      </li>
    </ul>
  )
}

export default TabNavigation