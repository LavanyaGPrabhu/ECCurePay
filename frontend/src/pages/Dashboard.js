// Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';  // Your styles for the dashboard page

const Dashboard = () => {
    const navigate = useNavigate();

    const handleEnterCardClick = () => {
        navigate('/enter-card'); // Navigate to the Enter Card page
    };

    const handleViewCardsClick = () => {
        navigate('/cards'); // Navigate to the View Cards page
    };

    return (
        <div className="dashboard-container">
            <h2>Welcome to Your Dashboard</h2>
            <div className="dashboard-buttons">
                <button onClick={handleEnterCardClick}>Enter New Card</button>
                <button onClick={handleViewCardsClick}>View Existing Cards in Wallet</button>
            </div>
        </div>
    );
};

export default Dashboard;
