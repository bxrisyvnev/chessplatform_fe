import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { fetchStreams } from '../services/spectateService';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 6;

function extractYouTubeVideoId(iframeHtml) {
    const match = iframeHtml.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function Spectate() {
    const containerRef = useRef(null);
    const anchorRef = useRef(null);
    const [streams, setStreams] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMoreBelow, setHasMoreBelow] = useState(true);
    const anchorOffset = useRef(0);
    const scrollLockRef = useRef(false);

    const loadInitial = async () => {
        const res1 = await fetchStreams(0, PAGE_SIZE);
        const res2 = await fetchStreams(1, PAGE_SIZE);
        setStreams([...res1.streams, ...res2.streams]);
        setStartIndex(0);
    };

    const appendStreams = async () => {
        if (!hasMoreBelow || loading || scrollLockRef.current) return;
        scrollLockRef.current = true;
        setLoading(true);

        const newPage = Math.floor((startIndex + streams.length) / PAGE_SIZE);
        const result = await fetchStreams(newPage, PAGE_SIZE);

        const combined = [...streams, ...result.streams];
        const uniqueById = Array.from(new Map(combined.map(s => [s.id, s])).values());

        setStreams(uniqueById);
        setHasMoreBelow(result.streams.length === PAGE_SIZE);
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
    }, [streams]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading) return;

        const { scrollTop, scrollHeight, clientHeight } = container;

        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMoreBelow) {
            appendStreams();
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
            <h2 className="mb-4">Live Games</h2>

            <div className="row">
                {streams.map((stream, index) => (
                    <div
                        key={stream.id}
                        className="col-md-6 mb-4"
                        ref={index === PAGE_SIZE ? anchorRef : null}
                    >
                        <Link to={`/streams/${stream.id}`} className="text-decoration-none text-dark">
                            <div className="card h-100 hover-shadow">
                                <div className="card-header">
                                    <strong>{stream.name}</strong>
                                </div>
                                <div className="ratio ratio-16x9">
                                    {extractYouTubeVideoId(stream.streamUrl) ? (
                                        <img
                                            src={`https://img.youtube.com/vi/${extractYouTubeVideoId(stream.streamUrl)}/hqdefault.jpg`}
                                            alt="Stream thumbnail"
                                            className="w-100 h-100 object-fit-cover rounded-bottom"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center text-muted bg-light w-100 h-100">
                                            <span>No preview available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="text-center py-3">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            )}
        </div>
    );
}

export default Spectate;
