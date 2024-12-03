import React, { useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import RegisterJobseeker from './components/RegisterJobseeker';
import RegisterRecruiter from './components/RegisterRecruiter';
import Login from './components/Login';
import ResumeUpload from './components/ResumeUpload';
import JobDescriptionUpload from './components/JobDescriptionUpload';
import Feedback from './components/Feedback';
import './App.css';
import './style.css';

function App() {
  const [resumeContent, setResumeContent] = useState('');
  const [jobDescriptionContent, setJobDescriptionContent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [activePage, setActivePage] = useState('home'); // This will control the main content
  const navigate = useNavigate();

  const handleResumeUploaded = (content) => {
    setResumeContent(content);
  };

  const handleJobDescriptionUploaded = (file) => {
    setJobDescriptionContent(file);
  };

  const analyzeFeedback = async () => {
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
          <Link to="/login" onClick={() => setActivePage('login')}><button>Login</button></Link>
        </div>
      </header>

      {/* Main Content (Only the Home page will be displayed when navigating) */}
      <main>
        {activePage === 'home' && (
          <>
            {/* Hero Section */}
            <header className="hero">
              <div className="container">
                <h1>Empower Your Career with Intelligent Insights</h1>
                <p>Upload your resume, analyze keywords, and get personalized job matches with AI-powered analysis.</p>
              </div>
            </header>

            {/* How It Works Section */}
            <section id="how-it-works" className="section">
              <div className="container">
                <h2>How It Works</h2>
                <div className="steps">
                  <div className="step">
                    <img src="i1.svg" alt="Step 1" />
                    <h3>Upload Resume</h3>
                    <p>Upload your resume for analysis in just one click.</p>
                  </div>
                  <div className="step">
                    <img src="i2.webp" alt="Step 2" />
                    <h3>Analyze Keywords</h3>
                    <p>Our AI scans your resume for relevant keywords and skills.</p>
                  </div>
                  <div className="step">
                    <img src="i3.jpg" alt="Step 3" />
                    <h3>Get Feedback</h3>
                    <p>Receive actionable insights to optimize your resume.</p>
                  </div>
                  <div className="step">
                    <img src="i4.png" alt="Step 4" />
                    <h3>Match with Jobs</h3>
                    <p>Find personalized job matches based on your skills.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section">
              <div className="container">
                <h2>Features</h2>
                <div className="features-grid">
                  <div className="feature">
                    <h3>AI-Powered Analysis</h3>
                    <p>Leverage cutting-edge AI to optimize your resume.</p>
                  </div>
                  <div className="feature">
                    <h3>Keyword Optimization</h3>
                    <p>Ensure your resume passes applicant tracking systems.</p>
                  </div>
                  <div className="feature">
                    <h3>Job Matching</h3>
                    <p>Find the best job opportunities tailored for you.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="section">
              <div className="container">
                <h2>What Our Users Say</h2>
                <div className="testimonials">
                  <div className="testimonial">
                  <img src="t1.jpeg" alt="testimonial 1" />
                    <p>"Resumify helped me land my dream job! The feedback was spot on."</p>
                    <h4>- John D.</h4>
                  </div>
                  <div className="testimonial">
                  <img src="t4.webp" alt="testimonial 2" />
                    <p>"I love how easy it was to optimize my resume. Highly recommend!"</p>
                    <h4>- Sarah K.</h4>
                  </div>
                  <div className="testimonial">
                  <img src="t3.webp" alt="testimonial 3" />
                    <p>"The AI analysis saved me hours of guesswork. Fantastic tool!"</p>
                    <h4>- Alex P.</h4>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="footer">
              <div className="container">
                <p>&copy; 2024 Resumify. All Rights Reserved.</p>
                <ul className="footer-links">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Contact Us</a></li>
                </ul>
              </div>
            </footer>
          </>
        )}

        {/* Login and Register Components */}
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
