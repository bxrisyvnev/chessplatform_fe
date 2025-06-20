import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getArticleById, updateArticle } from '../services/articleUpdate';

function UpdateArticle() {
    const { id } = useParams();

    const [title, setTitle]       = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [content, setContent]   = useState('');
    const [authorId, setAuthorId] = useState(null);

    const [message, setMessage]   = useState('');
    const [authorized, setAuthorized] = useState(true);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const article = await getArticleById(id);

                const loggedInUser =
                    JSON.parse(sessionStorage.getItem('user') || '{}');

                if (loggedInUser?.userId !== article.authorId) {
                    setAuthorized(false);
                    setMessage('You are not authorized to edit this article.');
                    return;
                }

                setTitle(article.articleTitle);
                setImageUrl(article.imageUrl);
                setContent(article.contentText);
                setAuthorId(article.authorId);
            } catch (err) {
                console.error('Failed to load article:', err);
                setMessage('Failed to load article.');
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dto = {
            updateId: parseInt(id, 10),
            articleTitle: title,
            imageUrl,
            contentText: content,
            authorId,
        };

        try {
            await updateArticle(dto);
            setMessage('Article updated successfully!');
        } catch (error) {
            console.error('Error updating article:', error);
            setMessage('Failed to update article.');
        }
    };

    if (!authorized && !loading) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="container py-4">
            <h2 className="mb-4">Update Article</h2>

            {loading ? (
                <p>Loading…</p>
            ) : (
                <>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="imageUrl" className="form-label">
                                Image URL
                            </label>
                            <input
                                type="url"
                                id="imageUrl"
                                className="form-control"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">
                                Content
                            </label>
                            <textarea
                                id="content"
                                className="form-control"
                                rows="6"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={authorId === null}
                        >
                            Update Article
                        </button>
                    </form>

                    {message && <p className="mt-3">{message}</p>}
                </>
            )}
        </div>
    );
}

export default UpdateArticle;
