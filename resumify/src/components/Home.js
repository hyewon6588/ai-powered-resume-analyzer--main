import React from 'react';

function Home() {
  return (
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
    </>
  );
}

export default Home;
