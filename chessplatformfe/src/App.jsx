import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Articles from './pages/Articles'
import News from './pages/News'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="news" element={<News />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App