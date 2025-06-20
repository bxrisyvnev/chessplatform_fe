import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startStream } from '../services/streamService';
import { Modal, Button } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import './StartStream.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function StartStream() {
    const [streamName, setStreamName] = useState('');
    const [embedCode, setEmbedCode]   = useState('');
    const [message, setMessage]       = useState('');
    const [error, setError]           = useState('');
    const [showInfo, setShowInfo]     = useState(false);

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
            const streamId = await startStream(streamName, embedCode);
            navigate(`/streams/${streamId}`);
        } catch (err) {
            console.error('Error starting stream:', err);
            setMessage('❌ Failed to start stream.');
        }
    };

    const openInfo  = () => setShowInfo(true);
    const closeInfo = () => setShowInfo(false);

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

                {/* Label row with Help button */}
                <div className="mb-1 d-flex justify-content-between align-items-center">
                    <label htmlFor="embedCode" className="form-label mb-0">
                        YouTube Embed Code
                    </label>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={openInfo}
                        title="How to get the embed code"
                    >
                        <FaInfoCircle className="me-1" /> Help
                    </button>
                </div>
                <div className="mb-3">
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
                    <div
                        className="iframe-wrapper"
                        dangerouslySetInnerHTML={{ __html: embedCode }}
                    />
                </div>
            )}

            <Modal show={showInfo} onHide={closeInfo} centered>
                <Modal.Header closeButton>
                    <Modal.Title>How to Get the YouTube Embed Code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        To stream a YouTube video here, you need a special piece of text called an <strong>embed code</strong>.
                        It lets the video play directly on this site.
                    </p>
                    <p>Follow these steps:</p>
                    <ol>
                        <li>Open the YouTube video you want.</li>
                        <li>Click the <strong>"Share"</strong> button below the video.</li>
                        <li>Select <strong>"Embed"</strong> (it has a &lt;&gt; icon).</li>
                        <li>You’ll see some code that starts with <code>&lt;iframe&gt;</code>.</li>
                        <li>Click <strong>"Copy"</strong> to copy that code.</li>
                        <li>Return here and paste it into the “YouTube Embed Code” box.</li>
                    </ol>
                    <p>
                        After that, press <strong>Start Stream</strong>, and your video will go live!
                    </p>
                    <p className="mt-3">Example embed code:</p>
                    <pre style={{ background: '#f8f9fa', padding: '1em', fontSize: '0.85em' }}>
{`<iframe 
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID" 
  frameBorder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen
></iframe>`}
                    </pre>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeInfo}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
