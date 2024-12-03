import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setUserName,setUserRole,onLogin }) {  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker');
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username, // Assuming username is derived from email
          password,
          role,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        // Save the token for future authenticated requests
        localStorage.setItem('token', data.token);

        // Set the username for the session
        setUserName(username);

        setUserRole(role);
        onLogin();
        alert('Logged in Successfully!')

        // Navigate to the same page for all users
        navigate('/');
      } else {
        alert(data.error || 'Login failed!');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          {/* Email: */}
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Role:
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="job_seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
 