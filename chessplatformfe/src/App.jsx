import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import News from './pages/News';
import Login from './pages/Login';
import Post from './pages/Post';
import { setupAxiosInterceptors } from './services/auth';
import './styles/App.css';
import UpdateArticle from "./pages/UpdateArticle.jsx";


// Setup axios interceptors for JWT
setupAxiosInterceptors();

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="news" element={<News />} />
          <Route path="post" element={<Post />} />
          <Route path="/update-article/:id" element={<UpdateArticle />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;