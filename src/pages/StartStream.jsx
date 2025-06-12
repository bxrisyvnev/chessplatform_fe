import { useState } from 'react';
import { startStream } from '../services/streamService';
import './StartStream.css'
import {useNavigate} from "react-router-dom";

function StartStream() {
    const [streamName, setStreamName] = useState('');
    const [embedCode, setEmbedCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isValidEmbed = (input) => {
        const pattern = /^<iframe\s+width="\d+"\s+height="\d+"\s+src="https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+".*?<\/iframe>$/;
        return pattern.test(input.trim());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidEmbed(embedCode)) {
            setError('❌ Please enter a valid YouTube embed iframe code.');
            return;
        }

        setError('');
        try {
            const streamId = await startStream(streamName, embedCode); // ✅ Get ID from service
            navigate(`/streams/${streamId}`); // ✅ Redirect here
        } catch (error) {
            console.error('Error starting stream:', error);
            setMessage("❌ Failed to start stream.");
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">Start New Stream</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="streamName" className="form-label">Stream Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="streamName"
                        value={streamName}
                        onChange={(e) => setStreamName(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="embedCode" className="form-label">YouTube Embed Code</label>
                    <textarea
                        className="form-control"
                        id="embedCode"
                        rows="4"
                        value={embedCode}
                        onChange={(e) => setEmbedCode(e.target.value)}
                        required
                        placeholder="Paste your full YouTube iframe embed code here..."
                    />
                </div>

                {error && <p className="text-danger">{error}</p>}

                <button type="submit" className="btn btn-primary">
                    Start Stream
                </button>
            </form>

            {message && <p className="mt-3">{message}</p>}

            {embedCode && isValidEmbed(embedCode) && (
                <div className="mt-5">
                    <h5>🔴 Live Stream Preview:</h5>
                        <div className="iframe-wrapper" dangerouslySetInnerHTML={{__html: embedCode}}/>
                </div>
            )}
        </div>
    );
}

export default StartStream;