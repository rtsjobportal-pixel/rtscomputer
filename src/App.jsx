import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import CandidateDashboard from './components/CandidateDashboard';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdminAuth = localStorage.getItem('adminAuth') === 'true';

  if (isAdminAuth) {
    return (
      <Router>
        <div className="app-container">
          <Navbar 
            user={{ email: 'Admin' }} 
            role="admin" 
            onLogout={() => {
              localStorage.removeItem('adminAuth');
              window.location.href = '/login';
            }} 
          />
          <main className="main-content">
            <Routes>
              <Route path="*" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    );
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (user) => {
    // Hardcoded Admin Account Bypass
    if (user.email === 'admin@rts.com') {
      setRole('admin');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setRole(data.role);
      } else {
        setRole('candidate');
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setRole('candidate');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} role={role} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={user ? <Navigate to={`/${role}-dashboard`} /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/candidate-dashboard" element={user && role === 'candidate' ? <CandidateDashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin-dashboard" element={user && role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
