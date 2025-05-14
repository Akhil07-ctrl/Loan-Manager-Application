import { IoMdHome } from "react-icons/io";
import { FaUserCircle, FaMoneyBillWave, FaChartPie, FaCreditCard } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import React from 'react';

import NotificationsMenu from '../NotificationsMenu';
import "./index.css";

const Header = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        // Clear the JWT token
        Cookies.remove('jwtToken');
        // Navigate to login page
        navigate("/login");
    };
    
    return (
        <div className="header">
            <h1>CREDIT APP</h1>
            <ul className="middle-nav">
                <li><span className="nav-link" onClick={() => navigate("/home")}><IoMdHome className="nav-icon" /> Home</span></li>
                <li><span className="nav-link"><FaMoneyBillWave className="nav-icon" /> Payments</span></li>
                <li><span className="nav-link"><FaChartPie className="nav-icon" /> Budget</span></li>
                <li><span className="nav-link"><FaCreditCard className="nav-icon" /> Card</span></li>
            </ul>
            <ul className="right-nav">
                <li><NotificationsMenu /></li>
                <li><span className="nav-link"><FaUserCircle /></span></li>
                <li><span className="nav-link" onClick={handleLogout}>Logout</span></li>
            </ul>
        </div>
    )
}

export default Header;