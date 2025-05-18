import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SongPool = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                const formattedUsers = response.data.map(user => ({
                    id: user.spotifyId,
                    name: user.displayName || user.spotifyId
                }));
                setUsers(formattedUsers);
            })
            .catch(error => console.error("Error fetching users:", error.response?.data || error.message));
    }, [navigate]);

    const handleCreatePool = () => {
        if (!selectedUser || selectedUser.length === 0) return;

        console.log("Creating pool with users:", selectedUser);

        axios.post('http://localhost:5000/api/create-pool', { userIds: selectedUser })
            .then(response => {
                console.log("Pool created:", response.data);
                navigate('/game', { state: { pool: response.data } });
            })
            .catch(error => console.error("Error creating song pool:", error.response?.data || error.message));
    };

    return (
        <div className="game-container">
            <h1 className="game-title">Create a Song Pool</h1>

            <select
                multiple
                value={selectedUser}
                onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions);
                    const selectedIds = options.map(option => option.value);
                    setSelectedUser(selectedIds);
                }}
                className="dropdown multi-select"
            >
                {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                ))}
            </select>

            <div className="button-group">
                <button onClick={handleCreatePool} className="button">
                    Create Pool
                </button>
                <button onClick={() => navigate('/dashboard')} className="button" style={{ backgroundColor: '#3498db' }}>
                    Back
                </button>
            </div>
        </div>
    );
};

export default SongPool;
