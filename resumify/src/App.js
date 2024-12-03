import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import RegisterJobseeker from './components/RegisterJobseeker';
import RegisterRecruiter from './components/RegisterRecruiter';
import Login from './components/Login';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionUpload from './components/JobDescriptionUpload';
import Feedback from './components/Feedback';
import Home from './components/Home';
import './App.css';
import './style.css';

function App() {
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescriptionContent, setJobDescriptionContent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('home'); // This will control the main content
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleResumeUploaded = (content) => {
    setResumeContent(content);
  };

  const handleJobDescriptionUploaded = (file) => {
    setJobDescriptionContent(file);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserRole('');
    navigate('/');
  };


  const analyzeFeedback = async () => {
    if (!resumeContent || !jobDescriptionContent) {
      setError('Please upload both the resume and job description files.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeContent);
    formData.append('job_description', jobDescriptionContent);

    const token = localStorage.getItem('token');

    try {
      const uploadResponse = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.text();
        setError(uploadError || 'Failed to upload files.');
        return;
      }
  
      const uploadResult = await uploadResponse.json();
  
      // Step 2: Analyze uploaded files
      const analyzeResponse = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_path: uploadResult.resume_path,
          job_description_path: uploadResult.job_description_path,
        }),
      });
  
      if (analyzeResponse.ok) {
        const analyzeResult = await analyzeResponse.json();
        setFeedback(analyzeResult.feedback || []);
        setMatchPercentage(analyzeResult.match_percentage || 0);
        setError('');
        navigate('/feedback');
      } else {
        const analyzeError = await analyzeResponse.text();
        setError(analyzeError || 'Failed to analyze files.');
      }
    } catch (err) {
      console.error('Error during analysis:', err);
      setError('An error occurred while analyzing files.');
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo-container">
          <Link to="/">
            <div>
              <img src="/logo.jpg" alt="Logo" className="logo" />
            </div>
          </Link>
          <h1 className="company-name">Resumeify</h1>
        </div>
        <div className="button-group">
          <Link to="/" onClick={() => setActivePage('home')}><button>Home</button></Link>
          <Link to="/register-jobseeker" onClick={() => setActivePage('register-jobseeker')}><button>Register</button></Link>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/login"><button>Login</button></Link>
          )}
        </div>
      </header>

      

        {/* Login and Register Components */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-jobseeker" element={<RegisterJobseeker setUserName={setUserName} />} />
          <Route path="/register-recruiter" element={<RegisterRecruiter />} />
          <Route
          path="/login"
          element={
            <Login
              setUserName={setUserName}
              setUserRole={setUserRole}
              onLogin={() => setIsLoggedIn(true)} // 로그인 시 상태 업데이트
            />
          }
        />
          <Route path="/upload" element={
            <div>
              <ResumeUpload onResumeUploaded={handleResumeUploaded} />
              <JobDescriptionUpload onJobDescriptionUploaded={handleJobDescriptionUploaded} />
              <button onClick={analyzeFeedback}>Analyze</button>
              {error && <p className="error">{error}</p>}
            </div>
          } />

          <Route path="/feedback" element={<Feedback feedback={feedback} matchPercentage={matchPercentage} />} />
        </Routes>
      {/* </main> */}
    </div>
  );
}

export default App;
