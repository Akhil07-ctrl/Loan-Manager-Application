import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { FaUsers, FaMoneyBillWave, FaChartBar, FaCheckCircle, FaTimesCircle, FaSpinner, FaChartLine } from 'react-icons/fa';
import AdminHeader from '../AdminHeader';
import LoansList from './LoansList';
import UsersList from './UsersList';
import StatCard from './StatCard';
import './index.css';
import AnalyticsDashboard from './AnalyticsDashboard';
import './AnalyticsDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    totalCashDisbursed: 0,
    recentLoans: [],
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchDashboardStats = useCallback(async () => {
    console.log('Fetching dashboard stats...');
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('jwtToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making API request to /api/admin/stats');
      const response = await axios({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        validateStatus: status => status === 200
      });

      console.log('Raw API Response:', response);
      
      if (!response.data) {
        console.error('Empty response data');
        throw new Error('No data received from server');
      }

      // Handle both {data: {...}} and direct object response formats
      const statsData = response.data.data || response.data;
      
      if (!statsData) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid API response format');
      }

      console.log('Processed stats data:', statsData);
      
      // Ensure all required fields are present with fallbacks
      const processedStats = {
        activeUsers: Number(statsData.activeUsers) || 0,
        totalLoans: Number(statsData.totalLoans) || 0,
        pendingLoans: Number(statsData.pendingLoans) || 0,
        approvedLoans: Number(statsData.approvedLoans) || 0,
        rejectedLoans: Number(statsData.rejectedLoans) || 0,
        totalCashDisbursed: Number(statsData.totalCashDisbursed) || 0,
        recentLoans: Array.isArray(statsData.recentLoans) ? statsData.recentLoans : [],
        recentUsers: Array.isArray(statsData.recentUsers) ? statsData.recentUsers : []
      };

      console.log('Setting dashboard stats:', processedStats);
      setStats(processedStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('AdminDashboard mounted');
    document.title = 'Admin Dashboard | Loan Manager';
    
    const token = Cookies.get('jwtToken');
    if (!token) {
      console.log('No JWT token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== 'admin') {
        console.log('User is not an admin, redirecting to home');
        navigate('/home');
        return;
      }
      
      fetchDashboardStats();
    } catch (error) {
      console.error('Failed to decode token:', error.message);
      navigate('/login');
    }
  }, [navigate, fetchDashboardStats]);

  // Render loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="dashboard-loader">
          <FaSpinner className="spinner" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="admin-dashboard">
        <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="dashboard-error">
          <p className="error-message">{error}</p>
          <button onClick={fetchDashboardStats} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render success state
  return (
    <div className="admin-dashboard">
      <AdminHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <StatCard
              icon={<FaUsers />}
              title="Active Users"
              value={stats.activeUsers}
              color="blue"
            />
            <StatCard
              icon={<FaMoneyBillWave />}
              title="Total Loans"
              value={stats.totalLoans}
              color="green"
            />
            <StatCard
              icon={<FaChartBar />}
              title="Pending Loans"
              value={stats.pendingLoans}
              color="yellow"
            />
            <StatCard
              icon={<FaCheckCircle />}
              title="Approved Loans"
              value={stats.approvedLoans}
              color="green"
            />
            <StatCard
              icon={<FaTimesCircle />}
              title="Rejected Loans"
              value={stats.rejectedLoans}
              color="red"
            />
            <StatCard
              icon={<FaMoneyBillWave />}
              title="Total Cash Disbursed"
              value={`$${stats.totalCashDisbursed.toLocaleString()}`}
              color="green"
            />
          </div>

          <div className="recent-activity">
            <div className="recent-loans">
              <h3>Recent Loan Applications</h3>
              <LoansList loans={stats.recentLoans} />
            </div>
            <div className="recent-users">
              <h3>Recent Users</h3>
              <UsersList users={stats.recentUsers} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && <AnalyticsDashboard />}
      {activeTab === 'loans' && <LoansList loans={stats.recentLoans} />}
      {activeTab === 'users' && <UsersList users={stats.recentUsers} />}
    </div>
  );
};
export default AdminDashboard;
              