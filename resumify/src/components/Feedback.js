import React from 'react';

const Feedback = ({ feedback }) => {
  return (
    <div>
      <h2>Feedback</h2>
      {feedback.length > 0 ? (
        <ul>
          {feedback.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No missing keywords found.</p>
      )}
    </div>
  );
};

export default Feedback;
