import React, { useState } from 'react';

const JobDescriptionUpload = ({ onJobDescriptionUploaded }) => {
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      onJobDescriptionUploaded(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid .txt file.');
    }
  };

  return (
    <div>
      <h2>Upload Job Description</h2>
      <input type="file" accept=".txt" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default JobDescriptionUpload;
