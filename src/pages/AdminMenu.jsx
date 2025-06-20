import { useEffect, useState } from 'react';
import { fetchReports, removeReport } from '../services/AdminReportService.js';

const PAGE_SIZE = 5;

function AdminMenu() {
    const [reports, setReports] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchReports(page, PAGE_SIZE);
                setReports(data.content || data.reports || []);
                setTotalPages(data.totalPages ?? 0);
            } catch (e) {
                setError('Failed to load reports');
            }
            setLoading(false);
        })();
    }, [page]);

    const handleDelete = async (id) => {
        if (!window.confirm(`Delete report #${id}?`)) return;
        try {
            await removeReport(id);
            if (reports.length === 1 && page > 0) setPage((p) => p - 1);
            else setPage((p) => p); // reload current page
        } catch {
            alert('Delete failed');
        }
    };

    const hasPrev = page > 0;
    const hasNext = page < totalPages - 1;

    return (
        <div className="container py-4">
            <h2 className="mb-3">Admin · Reports</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="table-responsive">
                <table className="table align-middle">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Date/Time</th>
                        <th>User ID</th>
                        <th />
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="text-center">
                                Loading…
                            </td>
                        </tr>
                    ) : reports.length ? (
                        reports.map((r) => (
                            <tr key={r.id} className={r.type === 'Article' ? 'table-secondary' : ''}>
                                <td>{r.id}</td>
                                <td>{r.type}</td>
                                <td style={{ maxWidth: '300px' }}>{r.description}</td>
                                <td>{new Date(r.dateTime).toLocaleString()}</td>
                                <td>{r.userId}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(r.id)}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No reports found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between">
                <button
                    className="btn btn-secondary"
                    disabled={!hasPrev}
                    onClick={() => setPage((p) => p - 1)}
                >
                    ◀ Prev
                </button>
                <span className="align-self-center">
          Page {page + 1} / {totalPages || 1}
        </span>
                <button
                    className="btn btn-secondary"
                    disabled={!hasNext}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next ▶
                </button>
            </div>
        </div>
    );
}

export default AdminMenu;
