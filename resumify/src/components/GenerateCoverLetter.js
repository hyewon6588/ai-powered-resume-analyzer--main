import React, { useState } from 'react';

function GenerateCoverLetter() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async () => {
    if (!resumeFile || !jobDescriptionFile) {
      setError('Please upload both resume and job description files.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescriptionFile);

    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

    try {
      // Upload files to get paths
      const uploadResponse = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        setError(uploadError.error || 'Failed to upload files.');
        return;
      }

      const uploadData = await uploadResponse.json();

      // Use the paths to generate the cover letter
      const generateResponse = await fetch('http://127.0.0.1:5000/generate_cover_letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_path: uploadData.resume_path,
          job_description_path: uploadData.job_description_path,
        }),
      });

      if (generateResponse.ok) {
        const data = await generateResponse.json();
        setCoverLetter(data.cover_letter || ''); // Display the generated cover letter
        setError('');
      } else {
        const errorData = await generateResponse.json();
        setError(errorData.error || 'Failed to generate cover letter.');
      }
    } catch (err) {
      console.error('Error generating cover letter:', err);
      setError('An error occurred while generating the cover letter.');
    }
  };

  return (
    <div>
      <h1>Generate Cover Letter</h1>
      <div>
        <label>
          Resume File:
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setResumeFile(e.target.files[0])}
          />
        </label>
      </div>
      <div>
        <label>
          Job Description File:
          <input
            type="file"
            accept=".txt"
            onChange={(e) => setJobDescriptionFile(e.target.files[0])}
          />
        </label>
      </div>
      <button onClick={handleFileUpload}>Generate Cover Letter</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {coverLetter && (
        <div>
          <h2>Generated Cover Letter:</h2>
          <textarea
            rows="10"
            cols="50"
            value={coverLetter}
            readOnly
          />
        </div>
      )}
    </div>
  );
}

export default GenerateCoverLetter;
