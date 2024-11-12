import React, { useState } from 'react';
import { extractTextFromPDF, extractTextFromDocx } from './TextExtraction'; 
const ResumeUpload = ({ onResumeUploaded }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or DOCX file.');
        setFile(null); 
      }
    }
  };

  const handleUpload = async () => {
    if (file) {
      try {
        let textContent = '';
        if (file.type === 'application/pdf') {
          textContent = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          textContent = await extractTextFromDocx(file);
        }
        onResumeUploaded(textContent);  
      } catch (err) {
        setError('Error extracting text from the file.');
      }
    } else {
      setError('Please select a valid file to upload.');
    }
  };

  return (
    <div>
      <h2>Upload Resume</h2>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default ResumeUpload;
