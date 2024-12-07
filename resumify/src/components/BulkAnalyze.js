import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BulkAnalyze({ isLoggedIn, userRole }) {
  const [resumes, setResumes] = useState([]);
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jobDescriptionPath, setJobDescriptionPath] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    if (!token || role !== 'recruiter') {
      alert('Access Denied: Only recruiters can access this page.');
      navigate('/');
    }
  }, [token, role, navigate]);

  if (!token || role !== 'recruiter') {
    return null;
  }

  const handleResumeFilesChange = (e) => {
    setResumes(Array.from(e.target.files));
  };

  const handleJobDescriptionFileChange = (e) => {
    setJobDescriptionFile(e.target.files[0]);
  };

  const getFileNameFromPath = (path) => {
    return path.split('/').pop();
  };

  const uploadFiles = async () => {
    if (resumes.length === 0 || !jobDescriptionFile) {
      setError('Please upload both resumes and the job description file.');
      return null;
    }
  
    const formData = new FormData();
    resumes.forEach((resume) => formData.append('resumes', resume));
    formData.append('job_description', jobDescriptionFile);
  
    const token = localStorage.getItem('token');
  
    try {
      const response = await fetch('http://127.0.0.1:5000/upload_multiple', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      console.log('Upload Response Status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload Error:', errorData);
        setError(errorData.error || 'Failed to upload files.');
        return null;
      }
  
      const data = await response.json();
      console.log('Upload Successful:', data);
  
      if (data.job_description_path && data.resumes.length > 0) {
        return {
          jobDescriptionPath: data.job_description_path,
          resumes: data.resumes,
        };
      } else {
        setError('Invalid response data from server.');
        return null;
      }
    } catch (err) {
      console.error('Error during file upload:', err);
      setError('An error occurred while uploading files.');
      return null;
    }
  };  

  const handleAnalyze = async ({ isLoggedIn, userRole }) => {
    const uploadResult = await uploadFiles(); // Upload files first

    if (!uploadResult || !uploadResult.jobDescriptionPath || !uploadResult.resumes) {
        setError('File upload failed. Cannot analyze resumes.');
        return;
    }
    const { jobDescriptionPath, resumes } = uploadResult;
    console.log('Uploaded Resumes:', resumes);
    console.log('Job Description Path:', jobDescriptionPath);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://127.0.0.1:5000/bulk_analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resumes: resumes,
          job_description_path: jobDescriptionPath,
        }),
      });

      console.log('Analyze Response Status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Analyze Error:', errorData);
        setError(errorData.error || 'Failed to analyze resumes.');
        return;
      }

      const data = await response.json();
      console.log('Analysis Results:', data);
      setResults(data.results || []);
      setError('');
    } catch (err) {
      console.error('Error during bulk analyze:', err);
      setError('An error occurred while analyzing resumes.');
    }
  };

  return (
    <div>
      <h1>Bulk Analyze Resumes</h1>
      <div>
        <label>
          Upload Resumes (PDF/DOCX):
          <input
            type="file"
            multiple
            accept=".pdf,.docx"
            onChange={handleResumeFilesChange}
          />
        </label>
        <ul>
          {resumes.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <label>
          Job Description File (TXT):
          <input
            type="file"
            accept=".txt"
            onChange={handleJobDescriptionFileChange}
          />
        </label>
        {jobDescriptionFile && <p>Uploaded: {jobDescriptionFile.name}</p>}
      </div>
      <button onClick={handleAnalyze}>Analyze Resumes</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length > 0 && (
        <div>
          <h2>Analysis Results</h2>
          <table>
            <thead>
              <tr>
                <th>Resume</th>
                <th>Match Percentage</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{getFileNameFromPath(result.resume)}</td>
                  <td>{result.match_percentage ? `${result.match_percentage}%` : 'Error'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BulkAnalyze;