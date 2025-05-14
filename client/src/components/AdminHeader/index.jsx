import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { FaUserCircle, FaTachometerAlt, FaMoneyBillWave, FaUsers, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import './index.css';

const AdminHeader = ({ activeTab, setActiveTab }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('jwtToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
      } catch (error) {
        console.error('Failed to decode token:', error.message);
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('jwtToken');
    navigate('/login');
  };

  return (
    <div className="admin-header">
      <div className="admin-header-top">
        <h1 className="admin-title">Loan Manager Admin</h1>
        <div className="admin-user">
          <div className="user-info">
            <FaUserCircle className="admin-user-icon" />
            <span className="admin-username">{username}</span>
          </div>
          <button 
            className="logout-button" 
            onClick={handleLogout}
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      
      <nav className="admin-nav">
        <ul>
          <li>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <FaTachometerAlt /> Dashboard
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'loans' ? 'active' : ''}
              onClick={() => setActiveTab('loans')}
            >
              <FaMoneyBillWave /> Loans
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <FaUsers /> Users
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              <FaChartLine /> Analytics
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminHeader;