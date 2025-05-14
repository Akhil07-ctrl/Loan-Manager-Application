import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import Cookies from 'js-cookie';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    monthlyLoans: [],
    monthlyRepayments: [],
    loanStatusDistribution: {},
    monthlyOutstandingLoans: []
  });

  const fetchAnalyticsData = async () => {
    try {
      const token = Cookies.get('jwtToken');
      const response = await axios({
        method: 'GET',
        url: '/api/admin/analytics',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const last6Months = months.slice(currentMonth - 5, currentMonth + 1);

  // Monthly Loans Released Chart
  const monthlyLoansOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Loans Released',
      },
    },
  };

  const monthlyLoansData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Number of Loans',
        data: analyticsData.monthlyLoans,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Monthly Repayments Chart
  const monthlyRepaymentsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Repayments Collected',
      },
    },
  };

  const monthlyRepaymentsData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Number of Repayments',
        data: analyticsData.monthlyRepayments,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Outstanding Loans Chart
  const outstandingLoansOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Outstanding Loans',
      },
    },
  };

  const outstandingLoansData = {
    labels: last6Months,
    datasets: [
      {
        label: 'Total Outstanding Amount',
        data: analyticsData.monthlyOutstandingLoans,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Loan Status Distribution Chart
  const loanStatusData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
    datasets: [
      {
        data: [
          analyticsData.loanStatusDistribution?.pending || 0,
          analyticsData.loanStatusDistribution?.approved || 0,
          analyticsData.loanStatusDistribution?.rejected || 0,
          analyticsData.loanStatusDistribution?.completed || 0,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="analytics-dashboard">
      <div className="analytics-grid">
        <div className="chart-container">
          <Line options={monthlyLoansOptions} data={monthlyLoansData} />
        </div>
        <div className="chart-container">
          <Bar options={monthlyRepaymentsOptions} data={monthlyRepaymentsData} />
        </div>
        <div className="chart-container">
          <Line options={outstandingLoansOptions} data={outstandingLoansData} />
        </div>
        <div className="chart-container">
          <Doughnut data={loanStatusData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
