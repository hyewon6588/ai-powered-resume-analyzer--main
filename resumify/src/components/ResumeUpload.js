import React, { useState } from 'react';
import { extractTextFromPDF, extractTextFromDocx } from './TextExtraction'; 
const ResumeUpload = ({ onResumeUploaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('Selected Resume File:', selectedFile);
        if (onResumeUploaded) {
          onResumeUploaded(selectedFile);
        }
        setError('');
      } else {
        setError('Please upload a PDF or DOCX file.');
        setFile(null); 
      }
    }
  };


  return (
    <div>
      <h2>Upload Resume</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ResumeUpload;
