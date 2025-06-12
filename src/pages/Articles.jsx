import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { fetchLatestArticles } from '../services/articleFeed.js';
import {
    submitComment,
    fetchCommentsByArticleId,
    deleteComment
} from '../services/PostComment.js';
import { deleteArticle } from '../services/DeleteArticle.js';
import { useNavigate } from 'react-router-dom';
import { searchArticleByTitle } from '../services/searchArticle.js';

const PAGE_SIZE = 5;
// Max pages to hold in memory during infinite scroll
const MAX_PAGES_IN_MEMORY = 3;

function Articles() {
    const containerRef = useRef(null);
    const anchorRef = useRef(null);
    const anchorOffset = useRef(0);
    const scrollLockRef = useRef(false);

    const [articles, setArticles] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMoreAbove, setHasMoreAbove] = useState(true);
    const [hasMoreBelow, setHasMoreBelow] = useState(true);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchPage, setSearchPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [commentsForArticle, setCommentsForArticle] = useState([]);

    const navigate = useNavigate();

    // Load initial feed or first search page
    const loadInitial = async () => {
        setLoading(true);
        try {
            if (!isSearching) {
                // fetch first two pages
                const res1 = await fetchLatestArticles(0, PAGE_SIZE);
                const res2 = await fetchLatestArticles(1, PAGE_SIZE);
                let combined = [...res1.articles, ...res2.articles];

                // unload if too many
                if (combined.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                    combined = combined.slice(0, PAGE_SIZE * MAX_PAGES_IN_MEMORY);
                }

                setArticles(combined);
                setStartIndex(0);
                setHasMoreAbove(false);
                setHasMoreBelow(res2.articles.length === PAGE_SIZE);
            } else {
                const data = await searchArticleByTitle(searchTerm.trim(), 0, PAGE_SIZE);
                setArticles(data.articles);
                setSearchPage(0);
                setTotalPages(data.totalPages);
                setHasMoreAbove(false);
                setHasMoreBelow(data.currentPage < data.totalPages - 1);
            }
        } catch (err) {
            console.error('Failed to load articles:', err);
        }
        setLoading(false);
    };

    // Prepend older feed pages
    const prependArticles = async () => {
        if (isSearching || startIndex <= 0 || loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        // remember scroll anchor
        if (anchorRef.current && containerRef.current) {
            const anchorBox = anchorRef.current.getBoundingClientRect();
            const containerBox = containerRef.current.getBoundingClientRect();
            anchorOffset.current = anchorBox.top - containerBox.top;
        }

        const newIndex = Math.max(startIndex - PAGE_SIZE, 0);
        const newPage = Math.floor(newIndex / PAGE_SIZE);

        try {
            const result = await fetchLatestArticles(newPage, PAGE_SIZE);
            let newList = [...result.articles, ...articles];
            let newStart = newIndex;

            // unload newest pages if over limit
            if (newList.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                newList = newList.slice(0, PAGE_SIZE * MAX_PAGES_IN_MEMORY);
                setHasMoreBelow(true);
            }

            setArticles(newList);
            setStartIndex(newStart);
            setHasMoreAbove(newStart > 0);
        } catch (err) {
            console.error('Failed to prepend articles:', err);
        }

        setLoading(false);
    };

    // Append newer pages (or next search page)
    const appendArticles = async () => {
        if (loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        try {
            if (!isSearching) {
                const newPage = Math.floor((startIndex + articles.length) / PAGE_SIZE);
                const result = await fetchLatestArticles(newPage, PAGE_SIZE);
                let newList = [...articles, ...result.articles];
                let newStart = startIndex;

                // unload oldest pages if over limit
                if (newList.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                    newList = newList.slice(PAGE_SIZE);
                    newStart += PAGE_SIZE;
                    setHasMoreAbove(true);
                }

                setArticles(newList);
                setStartIndex(newStart);
                setHasMoreBelow(result.articles.length === PAGE_SIZE);
            } else {
                const next = searchPage + 1;
                const data = await searchArticleByTitle(searchTerm.trim(), next, PAGE_SIZE);
                setArticles(prev => [...prev, ...data.articles]);
                setSearchPage(next);
                setHasMoreBelow(next < totalPages - 1);
            }
        } catch (err) {
            console.error('Failed to append articles:', err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadInitial();
    }, [isSearching]);

    useLayoutEffect(() => {
        // restore scroll position when prepending
        if (anchorRef.current && containerRef.current && anchorOffset.current > 0) {
            const anchorBox = anchorRef.current.getBoundingClientRect();
            const containerBox = containerRef.current.getBoundingClientRect();
            const shift = anchorBox.top - containerBox.top - anchorOffset.current;
            containerRef.current.scrollTop += shift;
            anchorOffset.current = 0;
        }
        scrollLockRef.current = false;
    }, [articles]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        const atTop = scrollTop < 50;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 50;

        if (atTop && hasMoreAbove) prependArticles();
        if (atBottom && hasMoreBelow) appendArticles();
    };

    // Search controls
    const handleSearch = () => {
        if (!searchTerm.trim()) return;
        setIsSearching(true);
        setSearchPage(0);
        setTotalPages(0);
    };
    const handleClearSearch = () => {
        setSearchTerm('');
        setIsSearching(false);
    };

    // Comment modal handlers
    const handleOpenModal = async (articleId) => {
        setSelectedArticleId(articleId);
        setCommentText('');
        setShowModal(true);
        const comments = await fetchCommentsByArticleId(articleId);
        setCommentsForArticle(comments);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedArticleId(null);
        setCommentsForArticle([]);
    };
    const handleSubmitComment = async () => {
        const success = await submitComment(commentText, selectedArticleId);
        if (success) {
            const comments = await fetchCommentsByArticleId(selectedArticleId);
            setCommentsForArticle(comments);
            setCommentText('');
        } else {
            alert('Failed to submit comment.');
        }
    };
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        const success = await deleteComment(commentId);
        if (success) {
            const updated = await fetchCommentsByArticleId(selectedArticleId);
            setCommentsForArticle(updated);
        } else {
            alert('Failed to delete comment.');
        }
    };
    const handleDeleteArticle = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article and its comments?')) return;
        const success = await deleteArticle(articleId);
        if (success) setArticles(prev => prev.filter(a => a.id !== articleId));
        else alert('Failed to delete article.');
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: '90vh', overflowY: 'scroll', padding: '1rem' }}
        >
            <h1 className="text-center">Chess Articles</h1>

            <div className="d-flex gap-2 mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                    disabled={loading && isSearching}
                >
                    {loading && isSearching ? 'Searching...' : 'Search'}
                </button>
                <button className="btn btn-secondary" onClick={handleClearSearch}>
                    Clear
                </button>
            </div>

            {articles.map((article, index) => (
                <div
                    className="card mb-3"
                    key={article.id}
                    ref={!isSearching && index === PAGE_SIZE ? anchorRef : null}
                >
                    {article.imageUrl && (
                        <img
                            src={article.imageUrl}
                            alt={article.articleTitle}
                            className="card-img-top"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                        />
                    )}
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <h5 className="card-title">{article.articleTitle}</h5>
                            {sessionStorage.getItem('user') &&
                                JSON.parse(sessionStorage.getItem('user')).userId === article.authorId && (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/update-article/${article.id}`)}
                                        >✏️</button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteArticle(article.id)}
                                        >🗑️</button>
                                    </div>
                                )}
                        </div>
                        <p className="card-text">{article.contentText}</p>
                        <p className="text-muted"><small>Author ID: {article.authorId}</small></p>
                        {article.commentsIds?.length > 0 && (
                            <p><strong>Comments:</strong> {article.commentsIds.length}</p>
                        )}
                        <button
                            className="btn btn-outline-primary btn-sm mt-2"
                            onClick={() => handleOpenModal(article.id)}
                        >
                            Comment
                        </button>
                    </div>
                </div>
            ))}

            {loading && (
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            )}

            {showModal && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1050
                    }}
                >
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Post a Comment</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} />
                            </div>
                            <div className="modal-body">
                                {commentsForArticle.length > 0 ? (
                                    <div className="px-1 pb-3">
                                        <h6 className="text-muted">Existing Comments:</h6>
                                        <ul className="list-group mb-3">
                                            {commentsForArticle.map(comment => {
                                                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                                                const isOwner = user.userId === comment.userId;
                                                return (
                                                    <li
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                        key={comment.id}
                                                    >
                                                        <div>
                                                            <strong>User {comment.userId}:</strong>{' '}
                                                            {comment.contentText || comment.text}
                                                        </div>
                                                        {isOwner && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >🗑️</button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="px-1 pb-3 text-muted">No comments yet.</div>
                                )}
                                <textarea
                                    className="form-control"
                                    rows="4"
                                    placeholder="Write your comment here..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmitComment}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Articles;
