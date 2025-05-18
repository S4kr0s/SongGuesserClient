import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import SongPool from './pages/SongPool';

function App() {
    const handleConnect = () => {
        window.location.href = 'https://songguesserserver.onrender.com/login';
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                        <h1 className="text-4xl mb-6">🎶 Spotify Music Game</h1>
                        <button 
                            onClick={handleConnect} 
                            className="bg-green-500 px-6 py-3 rounded-full text-lg hover:bg-green-700 transition">
                            Connect Spotify
                        </button>
                    </div>
                } />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/song-pool" element={<SongPool />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>
    );
}

export default App;
