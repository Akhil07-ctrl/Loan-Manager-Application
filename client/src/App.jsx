import {BrowserRouter as Router, Route, Routes} from "react-router-dom"
import { useState, useEffect } from "react"
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import RegisterForm from "../src/components/RegisterForm"
import LoginFrom from "../src/components/LoginForm"
import Home from "../src/components/Home"
import AdminDashboard from "../src/components/AdminDashboard"
import ProtectedRoute from "../src/components/ProtectedRoute"
import AdminRoute from "../src/components/AdminRoute"

import "./App.css"

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, checking authentication...');
    // Check user role from JWT token
    const token = Cookies.get('jwtToken');
    if (token) {
      console.log('JWT token found');
      try {
        const decodedToken = jwtDecode(token);
        console.log('User role:', decodedToken.role);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Failed to decode token:', error.message);
        console.log('Clearing invalid token...');
        Cookies.remove('jwtToken');
      }
    }
    setLoading(false);
  }, []);

  // Redirect admin users to admin dashboard
  const HomeComponent = () => {
    if (loading) return <div>Loading...</div>;
    
    if (userRole === 'admin') {
      return <AdminDashboard />;
    }
    
    return <Home />;
  };

  return (
    <Router>
        <Routes>
            <Route exact path="/" element={<RegisterForm />} />
            <Route path="/login" element={<LoginFrom />} />
            <Route path="/home" element={<ProtectedRoute><HomeComponent /></ProtectedRoute>} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            } />
        </Routes>
    </Router>
  )
}

export default App