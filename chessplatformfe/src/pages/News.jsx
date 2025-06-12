import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fetchOfficialNews } from '../services/newsService';
import { useNavigate } from 'react-router-dom';
import './News.css';

const PAGE_SIZE = 5;
const MAX_PAGES_IN_MEMORY = 3;

export default function News() {
    const containerRef = useRef(null);
    const anchorRef = useRef(null);
    const anchorOffset = useRef(0);
    const scrollLockRef = useRef(false);

    const [news, setNews] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMoreAbove, setHasMoreAbove] = useState(true);
    const [hasMoreBelow, setHasMoreBelow] = useState(true);

    const navigate = useNavigate();

    // Redirect non-admins
    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) {
            navigate('/login', { replace: true });
        } else if (!user.roles.includes('Admin')) {
            navigate('/not-authorized', { replace: true });
        }
    }, [navigate]);

    // Load initial two pages
    const loadInitial = async () => {
        setLoading(true);
        try {
            const page0 = await fetchOfficialNews(0, PAGE_SIZE);
            const page1 = await fetchOfficialNews(1, PAGE_SIZE);
            let combined = [...page0.content, ...page1.content];

            if (combined.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                combined = combined.slice(0, PAGE_SIZE * MAX_PAGES_IN_MEMORY);
            }

            setNews(combined);
            setStartIndex(0);
            setHasMoreAbove(false);
            setHasMoreBelow(page1.content.length === PAGE_SIZE);
        } catch (err) {
            console.error('Failed to load news:', err);
        }
        setLoading(false);
    };

    // Prepend older pages on scroll to top
    const prependNews = async () => {
        if (loading || scrollLockRef.current || startIndex <= 0) return;
        scrollLockRef.current = true;
        setLoading(true);

        // Save anchor offset
        if (anchorRef.current && containerRef.current) {
            const aBox = anchorRef.current.getBoundingClientRect();
            const cBox = containerRef.current.getBoundingClientRect();
            anchorOffset.current = aBox.top - cBox.top;
        }

        const newIndex = Math.max(startIndex - PAGE_SIZE, 0);
        const pageNum = Math.floor(newIndex / PAGE_SIZE);

        try {
            const res = await fetchOfficialNews(pageNum, PAGE_SIZE);
            let updated = [...res.content, ...news];

            if (updated.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                updated = updated.slice(0, PAGE_SIZE * MAX_PAGES_IN_MEMORY);
                setHasMoreBelow(true);
            }

            setNews(updated);
            setStartIndex(newIndex);
            setHasMoreAbove(newIndex > 0);
        } catch (err) {
            console.error('Failed to prepend news:', err);
        }
        setLoading(false);
    };

    // Append newer pages on scroll to bottom
    const appendNews = async () => {
        if (loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        const nextPage = Math.floor((startIndex + news.length) / PAGE_SIZE);
        try {
            const res = await fetchOfficialNews(nextPage, PAGE_SIZE);
            let updated = [...news, ...res.content];
            let newStart = startIndex;

            if (updated.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                updated = updated.slice(PAGE_SIZE);
                newStart += PAGE_SIZE;
                setHasMoreAbove(true);
            }

            setNews(updated);
            setStartIndex(newStart);
            setHasMoreBelow(res.content.length === PAGE_SIZE);
        } catch (err) {
            console.error('Failed to append news:', err);
        }
        setLoading(false);
    };

    // Handle scroll
    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const atTop = scrollTop < 50;
        const atBottom = scrollTop + clientHeight > scrollHeight - 50;

        if (atTop && hasMoreAbove) prependNews();
        if (atBottom && hasMoreBelow) appendNews();
    };

    // Initial load on mount
    useEffect(() => {
        loadInitial();
    }, []);

    // Restore scroll position after prepending
    useLayoutEffect(() => {
        if (anchorRef.current && containerRef.current && anchorOffset.current > 0) {
            const aBox = anchorRef.current.getBoundingClientRect();
            const cBox = containerRef.current.getBoundingClientRect();
            containerRef.current.scrollTop += (aBox.top - cBox.top - anchorOffset.current);
            anchorOffset.current = 0;
        }
        scrollLockRef.current = false;
    }, [news]);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: '90vh', overflowY: 'auto', padding: '1rem' }}
        >
            <h1 className="text-center mb-4">Official News</h1>

            {news.map((item, idx) => (
                <div
                    key={item.id}
                    className="card mb-3"
                    ref={idx === PAGE_SIZE ? anchorRef : null}
                >
                    <div className="card-body">
                        <h5 className="card-title">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                {item.title}
                            </a>
                        </h5>
                        <h6 className="card-subtitle mb-2 text-muted">
                            On {new Date(item.publishedDate).toLocaleString()}
                        </h6>
                        <p className="card-text">{item.description}</p>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            )}

            {!loading && news.length === 0 && (
                <p className="text-center text-muted">No news to display.</p>
            )}
        </div>
    );
}
