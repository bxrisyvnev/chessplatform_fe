import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { fetchLatestArticles } from '../services/ArticleFeed';
import {
    submitComment,
    fetchCommentsByArticleId,
    deleteComment
} from '../services/PostComment.js';
import { deleteArticle } from '../services/DeleteArticle.js';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 5;

function Articles() {
    const containerRef = useRef(null);
    const anchorRef = useRef(null);
    const [articles, setArticles] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMoreAbove, setHasMoreAbove] = useState(true);
    const [hasMoreBelow, setHasMoreBelow] = useState(true);
    const anchorOffset = useRef(0);
    const scrollLockRef = useRef(false);

    const [showModal, setShowModal] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [commentsForArticle, setCommentsForArticle] = useState([]);

    const navigate = useNavigate();

    const loadInitial = async () => {
        const res1 = await fetchLatestArticles(0, PAGE_SIZE);
        const res2 = await fetchLatestArticles(1, PAGE_SIZE);
        setArticles([...res1.articles, ...res2.articles]);
        setStartIndex(0);
    };

    const prependArticles = async () => {
        if (startIndex <= 0 || loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        if (anchorRef.current && containerRef.current) {
            const anchorBox = anchorRef.current.getBoundingClientRect();
            const containerBox = containerRef.current.getBoundingClientRect();
            anchorOffset.current = anchorBox.top - containerBox.top;
        }

        const newIndex = Math.max(startIndex - PAGE_SIZE, 0);
        const newPage = Math.floor(newIndex / PAGE_SIZE);
        const result = await fetchLatestArticles(newPage, PAGE_SIZE);

        setArticles(prev => [...result.articles, ...prev]);
        setStartIndex(newIndex);
        setHasMoreAbove(newIndex > 0);
        setLoading(false);
    };

    const appendArticles = async () => {
        if (!hasMoreBelow || loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        const newPage = Math.floor((startIndex + articles.length) / PAGE_SIZE);
        const result = await fetchLatestArticles(newPage, PAGE_SIZE);
        setArticles(prev => [...prev, ...result.articles]);
        setHasMoreBelow(result.articles.length === PAGE_SIZE);
        setLoading(false);
    };

    useLayoutEffect(() => {
        if (anchorRef.current && containerRef.current && anchorOffset.current > 0) {
            const anchorBox = anchorRef.current.getBoundingClientRect();
            const containerBox = containerRef.current.getBoundingClientRect();
            const newOffset = anchorBox.top - containerBox.top;
            containerRef.current.scrollTop += newOffset - anchorOffset.current;
            anchorOffset.current = 0;
        }
        scrollLockRef.current = false;
    }, [articles]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        if (scrollTop < 50 && hasMoreAbove) {
            prependArticles();
        } else if (scrollTop + clientHeight >= scrollHeight - 50 && hasMoreBelow) {
            appendArticles();
        }
    };

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
            alert("Failed to submit comment.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = window.confirm('Are you sure you want to delete this comment?');
        if (!confirmed) return;

        const success = await deleteComment(commentId);
        if (success) {
            const updatedComments = await fetchCommentsByArticleId(selectedArticleId);
            setCommentsForArticle(updatedComments);
        } else {
            alert("Failed to delete comment.");
        }
    };

    const handleDeleteArticle = async (articleId) => {
        const confirmed = window.confirm("Are you sure you want to delete this article and all its comments?");
        if (!confirmed) return;

        const success = await deleteArticle(articleId);
        if (success) {
            setArticles(prev => prev.filter(a => a.id !== articleId));
        } else {
            alert("Failed to delete article.");
        }
    };

    useEffect(() => {
        loadInitial();
    }, []);

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{ height: '90vh', overflowY: 'scroll', padding: '1rem' }}
        >
            <h1 className="text-center">Chess Articles</h1>

            {articles.map((article, index) => {
                const userStr = sessionStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const isAuthor = user?.userId === article.authorId;

                return (
                    <div
                        className="card mb-3"
                        key={article.id}
                        ref={index === PAGE_SIZE ? anchorRef : null}
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
                                {isAuthor && (
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => navigate(`/update-article/${article.id}`)}
                                            title="Edit article"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteArticle(article.id)}
                                            title="Delete article"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="card-text">{article.contentText}</p>
                            <p className="text-muted">
                                <small>Author ID: {article.authorId}</small>
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
                );
            })}

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
                                            {commentsForArticle.map((comment) => {
                                                const userStr = sessionStorage.getItem('user');
                                                const user = userStr ? JSON.parse(userStr) : null;
                                                const isOwner = user?.userId === comment.userId;

                                                return (
                                                    <li
                                                        className="list-group-item d-flex justify-content-between align-items-center"
                                                        key={comment.id}
                                                    >
                                                        <div>
                                                            <strong>User {comment.userId}:</strong> {comment.text}
                                                        </div>
                                                        {isOwner && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                title="Delete comment"
                                                            >
                                                                🗑️
                                                            </button>
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
                                    onChange={(e) => setCommentText(e.target.value)}
                                ></textarea>
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
