import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleById, updateArticle } from '../services/articleUpdate';

function UpdateArticle() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [authorId, setAuthorId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const article = await getArticleById(id);
            setTitle(article.articleTitle);
            setImageUrl(article.imageUrl);
            setContent(article.contentText);
            setAuthorId(article.authorId);
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const dto = {
            updateId: parseInt(id),
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

    return (
        <div className="container py-4">
            <h2 className="mb-4">Update Article</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">Image URL</label>
                    <input
                        type="url"
                        className="form-control"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Content</label>
                    <textarea
                        className="form-control"
                        id="content"
                        rows="6"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={authorId === null}>
                    Update Article
                </button>
            </form>

            {message && <p className="mt-3">{message}</p>}
        </div>
    );
}

export default UpdateArticle;
