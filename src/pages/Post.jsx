import { useState, useEffect } from 'react';
import { createArticle } from '../services/articlePost.js';

function Post() {
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [authorId, setAuthorId] = useState(null);

    useEffect(() => {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.userId) {
                    setAuthorId(user.userId);
                }
            } catch (e) {
                console.error('Failed to parse user from sessionStorage:', e);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await createArticle({
                articleTitle: title,
                imageUrl,
                contentText: content,
                authorId, // Send user's ID
            });

            setMessage('Article created successfully!');
            setTitle('');
            setImageUrl('');
            setContent('');
        } catch (error) {
            console.error('Error creating article:', error);
            setMessage('Failed to create article.');
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Create New Article</h2>

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
                    Create Article
                </button>
            </form>

            {message && <p className="mt-3">{message}</p>}
        </div>
    );
}

export default Post;
