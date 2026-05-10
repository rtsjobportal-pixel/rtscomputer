import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

function Navbar({ user, role, onLogout }) {
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">RTS Computer</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="welcome-text">Welcome, {user.email}</span>
            {role === 'admin' && <Link to="/admin-dashboard" className="nav-btn">Admin Panel</Link>}
            {role === 'candidate' && <Link to="/candidate-dashboard" className="nav-btn">My Dashboard</Link>}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn">Login</Link>
            <Link to="/register" className="nav-btn register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
