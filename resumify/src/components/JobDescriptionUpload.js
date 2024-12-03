import React, { useState } from 'react';

const JobDescriptionUpload = ({ onJobDescriptionUploaded }) => {
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check if the uploaded file is a valid .docx file
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        onJobDescriptionUploaded(selectedFile); // Pass the file to the parent component
        setError('');
      } else {
        setError('Please upload a valid .docx file.');
      }
    }
  };

  return (
    <div>
      <h2>Upload Job Description</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default JobDescriptionUpload;
