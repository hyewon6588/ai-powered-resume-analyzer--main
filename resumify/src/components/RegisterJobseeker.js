import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './RegisterJobseeker.css';

function RegisterJobseeker({ setUserName }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserName(username);
    navigate('/upload');
  };

  return (
    <div className="register-form">
      <h2>Register as Job Seeker</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit">Register</button>
      </form>
      <Link to="/register-recruiter">
        <button className="switch-btn">Register as Recruiter</button>
      </Link>
    </div>
  );
}

export default RegisterJobseeker;
