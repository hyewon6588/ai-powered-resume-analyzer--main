import React, { useState } from 'react';

const JobDescriptionUpload = ({ onJobDescriptionUploaded }) => {
  const [jobDescription, setJobDescription] = useState('');

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setJobDescription(newText);
    onJobDescriptionUploaded(newText);  
  };

  return (
    <div>
      <h2>Enter Job Description</h2>
      <textarea
        value={jobDescription}
        onChange={handleTextChange}
        placeholder="Paste job description text here"
        rows="10"
        cols="50"
      />
    </div>
  );
};

export default JobDescriptionUpload;
