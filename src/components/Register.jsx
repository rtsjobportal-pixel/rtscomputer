import { useState } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      
      // Save user role to 'users' table
      if (data?.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { id: data.user.id, email: email, role: 'candidate' }
          ]);
          
        if (insertError) {
          console.error("Failed to insert user role:", insertError);
          // Don't fail the whole registration if just the role insert failed, 
          // App.jsx will default to 'candidate' anyway if not found.
        }
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password (min 6 chars)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
          </div>
          <button type="submit" className="primary-btn">Register</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;
