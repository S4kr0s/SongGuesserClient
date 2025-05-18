import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';  // <-- Add the .js extension
import './index.css';  // Optional, if you have this file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
