import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './pages/signup';
import Login from './pages/login';
import CardPage from './pages/Cardpage'; // Example of a protected route
import { UserContext } from './UserContext'; // Import your UserContext
import './App.css'; // Import your CSS styles
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';  // New Dashboard page
import EnterCard from './pages/EnterCard';  // New EnterCard page
import Cards from './pages/Cards';  // New Cards page
import AboutUs from './pages/Aboutus';  // New AboutUs page

const App = () => {
    const [userId, setUserId] = useState(null); // State to hold the user ID

    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/about" element={<AboutUs/>} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/CardPage" element={<CardPage />} />
                        <Route path="/dashboard" element={<Dashboard />} /> 
                        <Route path="/enter-card" element={<EnterCard />} /> 
                        <Route path="/cards" element={<Cards />} /> 
                        {/* More routes as necessary */}
                        

                    </Routes>
                </div>
            </Router>
        </UserContext.Provider>
    );
}

export default App;
