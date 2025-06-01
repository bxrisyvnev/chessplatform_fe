import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    connectToChat,
    sendChatMessage,
    disconnectFromChat
} from '../services/chatSocket';
import {getStreamById, stopStream} from '../services/streamService';


function Stream() {
    const { id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [embedCode, setEmbedCode] = useState('');
    const [streamName, setStreamName] = useState('')
    const [viewerCount, setViewerCount] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [streamData, setStreamData] = useState(null);

    useEffect(() => {
        const fetchStream = async () => {
            try {
                const userStr = sessionStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                setCurrentUser(user);

                const data = await getStreamById(id);
                setStreamData(data);
                setEmbedCode(data.streamUrl);
                setStreamName(data.name);
            } catch (error) {
                console.error('Failed to load stream data:', error);
            }
        };

        fetchStream();

        // Connect to WebSocket chat
        connectToChat(
            id,
            (msg) => setMessages(prev => [...prev, msg]),
            (count) => setViewerCount(count)
        );

        const handleBeforeUnload = () => {
            disconnectFromChat(id);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup: disconnect on unmount or browser close
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            disconnectFromChat(id);
        };
    }, [id]);

    const handleStopStream = async () => {
        try {
            await stopStream(id);
            disconnectFromChat(id);
            window.location.href = '/'; // redirect after stopping stream
        } catch (error) {
            console.error('Failed to stop stream:', error);
        }
    };

    const handleSend = () => {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { username: 'Anonymous' };

        sendChatMessage(id, input, user.username || 'Anonymous');
        setInput('');
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">{streamName}</h2>

            <div className="row">
                <div className="col-md-8 mb-4">
                    <div className="bg-dark text-white rounded p-2" style={{height: '480px', overflow: 'hidden'}}>
                        {embedCode ? (
                            <div
                                dangerouslySetInnerHTML={{__html: embedCode}}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            />
                        ) : (
                            <div className="text-center p-5">
                                <h4>🔴 Live Stream Video Placeholder</h4>
                                <p className="text-muted">Your embedded video will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header">💬 Live Chat</div>
                        <div className="card-body" style={{height: '400px', overflowY: 'auto'}}>
                            {messages.map((msg, idx) => (
                                <div key={idx}>
                                    <strong>{msg.sender}:</strong> {msg.content}
                                </div>
                            ))}
                        </div>
                        <div className="card-footer d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                            />
                            <button className="btn btn-primary" onClick={handleSend}>Send</button>
                        </div>
                    </div>
                </div>
                <p><strong>Viewers:</strong> {viewerCount}</p>
                {currentUser?.userId === streamData?.streamerId && (
                    <button className="btn btn-danger mb-3" onClick={handleStopStream}>
                        🛑 Stop Stream
                    </button>
                )}
            </div>
        </div>
    );
}

export default Stream;