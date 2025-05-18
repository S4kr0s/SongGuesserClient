import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);

            // Remove the tokens from the URL
            window.history.replaceState({}, document.title, '/dashboard');
        }

        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error("No access token found, redirecting...");
            navigate('/');
            return;
        }

        axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            setUser(response.data);
        }).catch(error => {
            console.error("Error fetching user profile:", error.response?.data || error.message);
            navigate('/');
        });
    }, [navigate]);

    if (!user) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="game-container">
            <img src={user.images[0]?.url || "/default-profile.png"} alt="Profile" className="profile-picture" />
            <h1 className="game-title">Welcome, {user.display_name}!</h1>

            <div className="button-group">
                <button onClick={() => navigate('/song-pool')} className="button">
                    Create Song Pool
                </button>
                <button onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    navigate('/');
                }} className="button" style={{ backgroundColor: '#e74c3c' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
