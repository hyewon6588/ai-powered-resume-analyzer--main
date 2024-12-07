import React, { useState,useEffect } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import RoleBasedRoute from './components/RoleBasedRoute';
import RegisterJobseeker from './components/RegisterJobseeker';
import RegisterRecruiter from './components/RegisterRecruiter';
import Login from './components/Login';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionUpload from './components/JobDescriptionUpload';
import Feedback from './components/Feedback';
import GenerateCoverLetter from './components/GenerateCoverLetter';
import BulkAnalyze from './components/BulkAnalyze';
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
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleResumeUploaded = (content) => {
    setResumeContent(content);
  };

  const handleJobDescriptionUploaded = (file) => {
    setJobDescriptionContent(file);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
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
        setIsLoggedIn(true);
        setUserRole('job_seeker');
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
          {token && userRole === 'job_seeker' && (
            <>
              <Link to="/upload" onClick={() => setActivePage('analyze-resume')}>
                <button>Analyze Resume</button>
              </Link>
              <Link to="/generate-cover-letter" onClick={() => setActivePage('generate-cover-letter')}>
                <button>Generate Cover Letter</button>
              </Link>
            </>
          )}
          {token && userRole === 'recruiter' && (
            <>
              <Link to="/bulk-analyze" onClick={() => setActivePage('bulk-analyze')}>
                <button>Bulk Analyze</button>
              </Link>
            </>
          )}
          {!token && (
            <>
              <Link to="/register-jobseeker" onClick={() => setActivePage('register-jobseeker')}>
                <button>Register</button>
              </Link>
              <Link to="/login">
                <button>Login</button>
              </Link>
            </>
          )}
          {token && (
            <button onClick={handleLogout}>Logout</button>
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
              onLogin={() => setIsLoggedIn(true)}
            />
          }
        />
          <Route path="/upload" element={
            <RoleBasedRoute isLoggedIn={token} userRole={userRole} allowedRoles={['job_seeker']}>
              <div>
                <ResumeUpload onResumeUploaded={handleResumeUploaded} />
                <JobDescriptionUpload onJobDescriptionUploaded={handleJobDescriptionUploaded} />
                <button onClick={analyzeFeedback}>Analyze</button>
                {error && <p className="error">{error}</p>}
              </div>
            </RoleBasedRoute>
          } />
          <Route path="/feedback" element={
            <RoleBasedRoute isLoggedIn={token} userRole={userRole} allowedRoles={['job_seeker']}>
              <Feedback feedback={feedback} matchPercentage={matchPercentage} />
            </RoleBasedRoute>
          } />
          <Route path="/generate-cover-letter" element={
            <RoleBasedRoute isLoggedIn={token} userRole={userRole} allowedRoles={['job_seeker']}>
              <GenerateCoverLetter />
            </RoleBasedRoute>
          } />
          <Route path="/bulk-analyze" element={
            <RoleBasedRoute isLoggedIn={token} userRole={userRole} allowedRoles={['recruiter']}>
              <BulkAnalyze />
            </RoleBasedRoute>
            } />
        </Routes>
      {/* </main> */}
    </div>
  );
}

export default App;
