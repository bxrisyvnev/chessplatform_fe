// src/pages/CreateNewsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaNewspaper } from 'react-icons/fa';
import { fetchLatestNews, createNews } from '../services/newsService.js';
import './News.css';

export default function CreateNewsPage() {
    const [news, setNews]           = useState([]);
    const [selectedLinks, setSelectedLinks] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState('');
    const navigate = useNavigate();

    // guard: only Admin
    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        const user    = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            navigate('/login', { replace: true });
        } else if (!user.roles.includes('Admin')) {
            navigate('/not-authorized', { replace: true });
        }
    }, [navigate]);

    // load news
    useEffect(() => {
        fetchLatestNews()
            .then(items => setNews(items))
            .catch(msg => setError(msg))
            .finally(() => setLoading(false));
    }, []);

    const toggleSelect = link => {
        setSelectedLinks(prev =>
            prev.includes(link)
                ? prev.filter(l => l !== link)
                : [...prev, link]
        );
    };

    const handleCreate = async () => {
        setError(''); setSuccess('');
        const toCreate = news
            .filter(item => selectedLinks.includes(item.link))
            .map(({ title, link, publishedDate, description, author }) => ({
                title, link,
                publishedDate, // as ISO string
                description, author
            }));
        try {
            await createNews(toCreate);
            setSuccess('News created successfully!');
            setSelectedLinks([]);
        } catch (msg) {
            setError(msg);
        }
    };

    if (loading) {
        return (
            <div className="news-page text-center py-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="news-page text-center py-4">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="news-page">
            <h1>Official Chess News</h1>
            {success && <div className="alert alert-success">{success}</div>}
            <div className="mb-3">
                <button
                    className="btn btn-primary"
                    disabled={selectedLinks.length === 0}
                    onClick={handleCreate}
                >
                    Create ({selectedLinks.length})
                </button>
            </div>
            <div className="row">
                {news.map(item => {
                    const isSelected = selectedLinks.includes(item.link);
                    return (
                        <div
                            key={item.link}
                            className={`col-md-6 col-lg-4 mb-4`}
                        >
                            <div
                                className={`card h-100 ${
                                    isSelected ? 'border-primary' : ''
                                }`}
                                onClick={() => toggleSelect(item.link)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="card-body">
                                    <h5 className="card-title">
                                        <FaNewspaper className="me-2" />
                                        {item.title}
                                    </h5>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        By {item.author || 'Unknown'} on{' '}
                                        {new Date(item.publishedDate).toLocaleString()}
                                    </h6>
                                    <p className="card-text">
                                        {item.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="position-absolute top-0 end-0 p-2">
                                        <span className="badge bg-primary">✓</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
