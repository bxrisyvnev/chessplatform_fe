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
import { createReport } from '../services/ReportService.js';

const PAGE_SIZE = 5;
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

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchPage, setSearchPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [commentsForArticle, setCommentsForArticle] = useState([]);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTargetId, setReportTargetId] = useState(null);
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    const navigate = useNavigate();

    const loadInitial = async () => {
        setLoading(true);
        try {
            if (!isSearching) {
                const res1 = await fetchLatestArticles(0, PAGE_SIZE);
                const res2 = await fetchLatestArticles(1, PAGE_SIZE);
                let combined = [...res1.articles, ...res2.articles];
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

    const prependArticles = async () => {
        if (isSearching || startIndex <= 0 || loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        if (anchorRef.current && containerRef.current) {
            const a = anchorRef.current.getBoundingClientRect();
            const c = containerRef.current.getBoundingClientRect();
            anchorOffset.current = a.top - c.top;
        }

        const newIndex = Math.max(startIndex - PAGE_SIZE, 0);
        const newPage = Math.floor(newIndex / PAGE_SIZE);
        try {
            const res = await fetchLatestArticles(newPage, PAGE_SIZE);
            let list = [...res.articles, ...articles];
            if (list.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                list = list.slice(0, PAGE_SIZE * MAX_PAGES_IN_MEMORY);
                setHasMoreBelow(true);
            }
            setArticles(list);
            setStartIndex(newIndex);
            setHasMoreAbove(newIndex > 0);
        } catch (err) {
            console.error('Failed to prepend articles:', err);
        }
        setLoading(false);
    };

    const appendArticles = async () => {
        if (loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);
        try {
            if (!isSearching) {
                const nextPage = Math.floor((startIndex + articles.length) / PAGE_SIZE);
                const res = await fetchLatestArticles(nextPage, PAGE_SIZE);
                let list = [...articles, ...res.articles];
                if (list.length > PAGE_SIZE * MAX_PAGES_IN_MEMORY) {
                    list = list.slice(PAGE_SIZE);
                    setStartIndex(startIndex + PAGE_SIZE);
                    setHasMoreAbove(true);
                }
                setArticles(list);
                setHasMoreBelow(res.articles.length === PAGE_SIZE);
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

    const handleScroll = () => {
        const c = containerRef.current;
        if (!c || loading) return;
        const atTop = c.scrollTop < 50;
        const atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 50;
        if (atTop && hasMoreAbove) prependArticles();
        if (atBottom && hasMoreBelow) appendArticles();
    };

    useEffect(() => { loadInitial(); }, [isSearching]);
    useLayoutEffect(() => {
        if (anchorRef.current && containerRef.current && anchorOffset.current > 0) {
            const a = anchorRef.current.getBoundingClientRect();
            const c = containerRef.current.getBoundingClientRect();
            containerRef.current.scrollTop += (a.top - c.top - anchorOffset.current);
            anchorOffset.current = 0;
        }
        scrollLockRef.current = false;
    }, [articles]);

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

    const handleOpenModal = async id => {
        setSelectedArticleId(id);
        setCommentText('');
        setShowModal(true);
        setCommentsForArticle(await fetchCommentsByArticleId(id));
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedArticleId(null);
        setCommentsForArticle([]);
    };
    const handleSubmitComment = async () => {
        const ok = await submitComment(commentText, selectedArticleId);
        if (ok) {
            setCommentsForArticle(await fetchCommentsByArticleId(selectedArticleId));
            setCommentText('');
        } else alert('Failed to submit comment.');
    };
    const handleDeleteComment = async cid => {
        if (!window.confirm('Delete this comment?')) return;
        const ok = await deleteComment(cid);
        if (ok) setCommentsForArticle(await fetchCommentsByArticleId(selectedArticleId));
        else alert('Failed to delete comment.');
    };

    const handleDeleteArticle = async aid => {
        if (!window.confirm('Delete this article and its comments?')) return;
        const ok = await deleteArticle(aid);
        if (ok) setArticles(prev => prev.filter(a => a.id !== aid));
        else alert('Failed to delete article.');
    };

    const openReportModal = (id, type) => {
        setReportTargetId(id);
        setReportType(type);           // will be "Article" or "Comment"
        setReportDescription('');
        setShowReportModal(true);
    };

    /**  Ensures DTO matches backend expectations (LocalDateTime & non-blank fields). */
    const handleReportSubmit = async () => {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const tokenMissing = !user?.token;
        if (tokenMissing) {
            alert('Not logged in – cannot send report.');
            return;
        }

        // Create LocalDateTime-friendly string
        const timestamp = new Date().toISOString().split('.')[0];

        try {
            await createReport({
                updateId: reportTargetId ?? null,
                description: reportDescription || '',
                type: reportType,          // "Article" / "Comment" (NotBlank)
                dateTime: timestamp,       // "2025-06-19T12:34:56"
                userId: user.userId        // NotNull
            });
            setShowReportModal(false);
            alert('Report submitted.');
        } catch (err) {
            alert('Failed to submit report.');
        }
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: '90vh', overflowY: 'scroll', padding: '1rem' }}
        >
            <h1 className="text-center">Chess Articles</h1>

            {/* search bar */}
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

            {/* article list */}
            {articles.map((article, i) => (
                <div
                    className="card mb-3"
                    key={article.id}
                    ref={!isSearching && i === PAGE_SIZE ? anchorRef : null}
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
                            <div className="d-flex gap-2">
                                {sessionStorage.getItem('user') &&
                                    JSON.parse(sessionStorage.getItem('user')).userId === article.authorId && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => navigate(`/update-article/${article.id}`)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteArticle(article.id)}
                                            >
                                                🗑️
                                            </button>
                                        </>
                                    )}
                                <button
                                    className="btn btn-sm btn-outline-warning"
                                    title="Report this article"
                                    onClick={() => openReportModal(article.id, 'Article')}
                                >
                                    ⚠️
                                </button>
                            </div>
                        </div>
                        <p className="card-text">{article.contentText}</p>
                        <p className="text-muted">
                            <small>Author Name: {article.authorName}</small>
                        </p>
                        {article.commentsIds?.length > 0 && (
                            <p>
                                <strong>Comments:</strong> {article.commentsIds.length}
                            </p>
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

            {/* comment modal */}
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
                                            {commentsForArticle.map(c => {
                                                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                                                const isOwner = user.userId === c.userId;
                                                return (
                                                    <li
                                                        key={c.id}
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                    >
                                                        <div>
                                                            <strong>User {c.userId}:</strong> {c.contentText || c.text}
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            {isOwner && (
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                >
                                                                    🗑️
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-outline-warning"
                                                                title="Report this comment"
                                                                onClick={() => openReportModal(c.id, 'Comment')}
                                                            >
                                                                ⚠️
                                                            </button>
                                                        </div>
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

            {/* report modal */}
            {showReportModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Report {reportType}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowReportModal(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    placeholder="Describe the issue..."
                                    value={reportDescription}
                                    onChange={e => setReportDescription(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={handleReportSubmit}>
                                    Submit Report
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
