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
  const [userName, setUserName] = useState('');

  const navigate = useNavigate(); 

  const handleResumeUploaded = (content) => {
    setResumeContent(content);
  };

  const handleJobDescriptionUploaded = (content) => {
    setJobDescriptionContent(content);
  };

  const analyzeFeedback = () => {
    if (!resumeContent || !jobDescriptionContent) return;

    const feedbackList = ['Thank you for using Resumify'];
    setFeedback(feedbackList);

    navigate('/feedback');
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
            </div>
          } />

          <Route path="/feedback" element={<Feedback feedback={feedback} />} />

          <Route path="/" element={<h2>Welcome to Resumeify!</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
