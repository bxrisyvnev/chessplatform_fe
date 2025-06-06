import { useEffect, useState } from 'react';
import { fetchUserProfileWithComments } from '../services/fetchProfileData';
import { isAuthenticated } from '../services/auth';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            setError('User not authenticated');
            return;
        }

        fetchUserProfileWithComments()
            .then(data => setProfile(data))
            .catch(err => setError('Failed to load profile: ' + err.message));
    }, []);

    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div>Loading...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">Profile</h2>

            <div className="card mb-4">
                <div className="card-body">
                    <h3>{profile.username}</h3>
                    <p><strong>Age:</strong> {profile.age}</p>
                    <p><strong>Display Name:</strong> {profile.displayName}</p>
                    <p><strong>Nationality:</strong> {profile.nationality}</p>

                    {/* Admin-specific */}
                    {'monthlySalary' in profile && (
                        <>
                            <p><strong>Monthly Salary:</strong> ${profile.monthlySalary}</p>
                            <p><strong>Contract Start Date:</strong> {profile.contractStartDate}</p>
                            <p><strong>Contract End Date:</strong> {profile.contractEndDate}</p>
                            <p><strong>Address:</strong> {profile.address}</p>
                        </>
                    )}

                    {/* ProfessionalPlayer-specific */}
                    {'winRate' in profile && (
                        <>
                            <p><strong>Player Elo:</strong> {profile.playerElo}</p>
                            <p><strong>Win Rate:</strong> {profile.winRate}%</p>
                            <p><strong>Games Played:</strong> {profile.noOfGamesPlayed}</p>
                            <p><strong>Follower Count:</strong> {profile.followerCount}</p>
                            <p><strong>Chroma:</strong> {profile.chroma}</p>
                        </>
                    )}

                    {/* SpectatorPlayer-specific */}
                    {'hasPass' in profile && (
                        <>
                            <p><strong>Player Elo:</strong> {profile.playerElo}</p>
                            <p><strong>Games Played:</strong> {profile.noOfGamesPlayed}</p>
                            <p><strong>Chat Banned:</strong> {profile.chatBanned ? 'Yes' : 'No'}</p>
                            <p><strong>Game Banned:</strong> {profile.gameBanned ? 'Yes' : 'No'}</p>
                            <p><strong>Chroma:</strong> {profile.chroma}</p>
                            <p><strong>Pass Holder:</strong> {profile.hasPass ? 'Yes' : 'No'}</p>
                        </>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h4>User Comments</h4>
                    {profile.comments?.length ? (
                        <ul className="list-group">
                            {profile.comments.map(c => (
                                <li key={c.id} className="list-group-item">
                                    <strong>Article:</strong> {c.name} <br />
                                    <strong>Comment:</strong> {c.text}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted">No comments yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
