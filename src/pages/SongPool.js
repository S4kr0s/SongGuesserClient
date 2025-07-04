import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SongPool = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://songguesserserver.onrender.com/api/users')
            .then(response => {
                console.log("Fetched users:", response.data);
                const formattedUsers = response.data.map(user => ({
                    id: user.id,
                    name: user.name
                }));
                setUsers(formattedUsers);
            })
            .catch(error => console.error("Error fetching users:", error.response?.data || error.message));
    }, []);

    const handleCreatePool = () => {
        if (!selectedUser || selectedUser.length === 0) return;

        console.log("Creating pool with users:", selectedUser);

        axios.post('https://songguesserserver.onrender.com/api/create-pool', { userIds: selectedUser })
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
