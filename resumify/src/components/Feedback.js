import React, {useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = ({ feedback, matchPercentage}) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  const navigate = useNavigate();

  useEffect(() => {
    if (!Boolean(token) || role != 'job_seeker') {
      alert('Access Denied: Only job seekers can access this page.');
      navigate('/'); // Redirect to home
    }
  }, [token, role, navigate]);


  if (!token || role !== 'job_seeker') {
    return null; // Prevent rendering if unauthorized
  };

  let message = '';
  let feedbackList = [];

  if (typeof feedback === 'string') {
    const splitFeedback = feedback.split(':');
    message = splitFeedback[0] + ':';
    feedbackList = splitFeedback[1]
      ? splitFeedback[1].split(',').map((item) => item.trim())
      .filter(
        (item) =>
          item &&
          !item.match(/^[^a-zA-Z0-9]+$/)
        )
      : [];
  }
  
  return (
    <div>
      <h2>Feedback</h2>
      <p><strong>Match Percentage:</strong> {matchPercentage ?? 0}%</p>
      {feedbackList&&feedbackList.length > 0 ? (
        <>
          <p><strong>{message}</strong></p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            listStyleType: 'none',
            padding: 0,
          }}
        >
          {feedbackList.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#f9f9f9',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
        </>
      ) : (
        <p>No missing keywords found.</p>
      )}
    </div>
  );
};

export default Feedback;
