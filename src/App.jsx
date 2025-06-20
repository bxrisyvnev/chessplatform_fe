import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import News from './pages/News';
import Login from './pages/Login';
import Post from './pages/Post';
import StartStream from './pages/StartStream';
import Spectate from './pages/Spectate';
import Stream from './pages/Stream';
import Profile from './pages/Profile';
import Register from './pages/Register';
import UpdateArticle from './pages/UpdateArticle.jsx';
import CreateNewsPage from './pages/CreateNewsPage';
import AdminMenu from './pages/AdminMenu.jsx';
import { setupAxiosInterceptors } from './services/auth';

import RequireAdmin from './services/RequireAdmin.js';
import './styles/App.css';

setupAxiosInterceptors();

function App() {
  return (
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="news" element={<News />} />
            <Route path="post" element={<Post />} />
            <Route path="update-article/:id" element={<UpdateArticle />} />
            <Route path="start-stream" element={<StartStream />} />
            <Route path="spectate" element={<Spectate />} />
            <Route path="streams/:id" element={<Stream />} />
            <Route path="profile" element={<Profile />} />

            {/*admin-only routes */}
            <Route
                path="createnews"
                element={
                  <RequireAdmin>
                    <CreateNewsPage />
                  </RequireAdmin>
                }
            />
            <Route
                path="admin"
                element={
                  <RequireAdmin>
                    <AdminMenu />
                  </RequireAdmin>
                }
            />
          </Route>
        </Routes>
      </div>
  );
}

export default App;
