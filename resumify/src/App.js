import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom'; 
import RegisterJobseeker from './components/RegisterJobseeker';
import RegisterRecruiter from './components/RegisterRecruiter';
import Login from './components/Login';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionUpload from './components/JobDescriptionUpload';
import Feedback from './components/Feedback';
import './App.css';

function App() {
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescriptionContent, setJobDescriptionContent] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleResumeUploaded = (content) => {
    setResumeContent(content);
  };

  const handleJobDescriptionUploaded = (content) => {
    setJobDescriptionContent(content);
  };

  const analyzeFeedback = async() => {
    if (!resumeContent || !jobDescriptionContent) {
      setError('Please upload both the resume and job description files.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeContent);
    formData.append('job_description', jobDescriptionContent);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Backend Response:', result);

        setFeedback(result.feedback || []);
        setMatchPercentage(result.match_percentage || 0);
        setError('');
        setTimeout(() => {
          navigate('/feedback');
        }, 100);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to analyze files.');
      }
    } catch (err) {
      console.error('Error analyzing files:', err);
      setError('An error occurred while analyzing files.');
    }
  };

  return (
    <div className="App">
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
          <Link to="/register-jobseeker"><button>Register</button></Link>
          <Link to="/login"><button>Login</button></Link>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/register-jobseeker" element={<RegisterJobseeker setUserName={setUserName} />} />
          <Route path="/register-recruiter" element={<RegisterRecruiter />} />
          <Route path="/login" element={<Login setUserName={setUserName} />} />

          <Route path="/upload" element={
            <div>
              <ResumeUpload onResumeUploaded={handleResumeUploaded} />
              <JobDescriptionUpload onJobDescriptionUploaded={handleJobDescriptionUploaded} />
              <button onClick={analyzeFeedback}>Analyze</button>
              {error && <p className="error">{error}</p>}
            </div>
          } />

          <Route path="/feedback" element={<Feedback feedback={feedback} matchPercentage={matchPercentage} />} />

          <Route path="/" element={<h2>Welcome to Resumeify!</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
