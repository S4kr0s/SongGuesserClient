import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tracks, setTracks] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [revealState, setRevealState] = useState(-1);
    const [progress, setProgress] = useState(0);
    const playerRef = useRef(null);
    const deviceIdRef = useRef(null);
    const intervalRef = useRef(null);
    const revealTimeoutRef = useRef([]);

    useEffect(() => {
        const loadTracks = () => {
            if (location.state && location.state.pool) {
                console.log("Tracks loaded:", location.state.pool);
                setTracks(location.state.pool);
            } else {
                console.error('No pool found in state, redirecting...');
                navigate('/song-pool');
            }
        };

        loadTracks();
    }, [location.state, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error("No access token found, redirecting...");
            navigate('/song-pool');
            return;
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Spotify Game Player',
                getOAuthToken: cb => cb(token),
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                playerRef.current = player;
                deviceIdRef.current = device_id;
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();
        };

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
    }, [navigate]);

    const activatePlayer = async (device_id, token) => {
        try {
            await axios.put(
                'https://api.spotify.com/v1/me/player',
                { device_ids: [device_id], play: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Player activated");
        } catch (error) {
            console.error("Error activating player:", error.response?.data || error.message);
        }
    };

    const startPlayback = async (index) => {
        const token = localStorage.getItem('accessToken');
        const device_id = deviceIdRef.current;
        const currentTrack = tracks[index];

        if (!token) {
            console.error("No access token found, redirecting...");
            return;
        }

        if (!device_id || !currentTrack) {
            console.error("No active device or track available");
            return;
        }

        try {
            // Transfer playback to this device
            await activatePlayer(device_id, token);

            // Start playback
            await axios.put(
                'https://api.spotify.com/v1/me/player/play',
                {
                    uris: [currentTrack.uri],
                    position_ms: 0
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setCurrentTrackIndex(index);
            setRevealState(0);
            startReveals();
        } catch (error) {
            console.error('Error starting playback:', error.response?.data || error.message);
        }
    };


    const startReveals = () => {
        const revealDurations = [15000, 15000, 5000];  // Artist, Title, Cover

        setRevealState(0);
        setProgress(0);

        // Clear any previous timers
        revealTimeoutRef.current.forEach(clearTimeout);
        clearInterval(intervalRef.current);
        revealTimeoutRef.current = [];

        let currentStage = 0;

        // Set the reveal stages
        revealDurations.forEach((duration, index) => {
            const totalElapsed = revealDurations.slice(0, index + 1).reduce((a, b) => a + b, 0);
            
            revealTimeoutRef.current.push(
                setTimeout(() => {
                    setRevealState(index + 1);
                    setProgress(0);
                    currentStage++;

                    // Start the next stage's progress bar
                    if (currentStage < revealDurations.length) {
                        startProgress(revealDurations[currentStage]);
                    }
                }, totalElapsed)
            );
        });

        // Start the first stage progress
        startProgress(revealDurations[0]);
    };

    const startProgress = (duration) => {
        setProgress(0);
        clearInterval(intervalRef.current);

        const step = 100 / (duration / 100);
        intervalRef.current = setInterval(() => {
            setProgress(prev => {
                const nextValue = prev + step;
                return nextValue > 100 ? 100 : nextValue;
            });
        }, 100);
    };

    const handleNext = () => {
        stopPlayback();

        // Correctly advance the track index
        const nextIndex = (currentTrackIndex + 1) % tracks.length;

        // Reset the reveal state BEFORE updating the track
        setRevealState(-1);
        setProgress(0);

        // Wait for the index to update before starting the next track
        setTimeout(() => startPlayback(nextIndex), 500);
    };

    const pausePlayback = () => {
        const token = localStorage.getItem('accessToken');
        const device_id = deviceIdRef.current;

        if (!device_id) {
            console.error("No active device available");
            return;
        }

        axios.put(
            'https://api.spotify.com/v1/me/player/pause',
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        ).then(() => {
            console.log("Playback paused");
        }).catch(error => {
            console.error('Error pausing playback:', error.response?.data || error.message);
        });
    };

    const stopPlayback = () => {
        if (playerRef.current) {
            playerRef.current.pause();
        }
        setRevealState(-1);
        setProgress(0);
        clearInterval(intervalRef.current);
        revealTimeoutRef.current.forEach(clearTimeout);
        revealTimeoutRef.current = [];  // Clear the array to prevent double triggers
    };

    const handleResolve = () => {
        setRevealState(3);
        setProgress(100);
        clearInterval(intervalRef.current);
        revealTimeoutRef.current.forEach(clearTimeout);
        revealTimeoutRef.current = [];
    };

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center p-6 bg-gray-800 text-white min-h-screen">
                <h1 className="text-4xl mb-6">🎶 Loading Tracks...</h1>
            </div>
        );
    }

    const currentTrack = tracks[currentTrackIndex];

    return (
        <div className="game-container">
            <h1 className="game-title">🎶 Guess the Song</h1>

            {/* Reveals */}
            <div className={`reveal ${revealState >= 1 ? 'visible' : ''}`}>
                {currentTrack.artist}
            </div>
            <div className={`reveal ${revealState >= 2 ? 'visible' : ''}`}>
                {currentTrack.name}
            </div>
            <img 
                src={currentTrack.albumCover} 
                alt="Album Cover" 
                className={`album-cover ${revealState === 3 ? 'visible' : ''}`}
            />

            {/* Progress Bar */}
            {revealState >= 0 && revealState < 3 && (
                <div className="progress-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Buttons */}
            <div className="button-group">
                {revealState === -1 ? (
                    <button onClick={() => startPlayback(0)} className="button">
                        Start
                    </button>
                ) : (
                    <>
                        <button onClick={stopPlayback} className="button" style={{ backgroundColor: '#e74c3c' }}>
                            Stop
                        </button>
                        <button onClick={handleResolve} className="button" style={{ backgroundColor: '#f1c40f' }}>
                            Resolve
                        </button>
                        <button onClick={handleNext} className="button" style={{ backgroundColor: '#3498db' }}>
                            Next
                        </button>
                    </>
                )}
            </div>
        </div>
    );


};

export default Game;
