import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function CandidateDashboard({ user }) {
  const [jobPosition, setJobPosition] = useState('');
  const [fullName, setFullName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);

  const JOB_POSITIONS = [
    'Software Faculty',
    'Hardware Faculty',
    'Receptionist',
    'Teacher',
    'Peon',
    'Office Support'
  ];

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile || !jobPosition || !fullName) {
      setMessage('Please fill all fields and select a file.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // 1. Upload resume to Supabase Storage (bucket: 'resumes')
      const fileName = `${Date.now()}_${resumeFile.name}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile);
        
      if (uploadError) throw uploadError;

      // 2. Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      // 3. Save application to Supabase Database
      const { error: dbError } = await supabase
        .from('applications')
        .insert([
          {
            user_id: user.id,
            email: user.email,
            job_position: jobPosition,
            full_name: fullName,
            resume_url: publicUrl,
            file_name: resumeFile.name,
          }
        ]);
        
      if (dbError) throw dbError;

      setMessage('Resume uploaded successfully!');
      setJobPosition('');
      setFullName('');
      setResumeFile(null);
      e.target.reset(); // reset file input
      fetchApplications();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage('Failed to upload resume. ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Candidate Dashboard</h2>
      
      <div className="dashboard-card">
        <h3>Submit New Application</h3>
        {message && <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</div>}
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Job Position</label>
            <select value={jobPosition} onChange={(e) => setJobPosition(e.target.value)} required>
              <option value="" disabled>Select a position</option>
              {JOB_POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Resume File (Any format)</label>
            <input type="file" onChange={handleFileChange} required />
          </div>
          <button type="submit" className="primary-btn" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </form>
      </div>

      <div className="dashboard-card mt-4">
        <h3>My Submissions</h3>
        {applications.length === 0 ? (
          <p>No applications submitted yet.</p>
        ) : (
          <ul className="application-list">
            {applications.map(app => (
              <li key={app.id} className="application-item">
                <div>
                  <strong>{app.full_name}</strong> - {app.job_position || app.candidate_id}
                  <br />
                  <small>Submitted on: {new Date(app.submitted_at).toLocaleString()}</small>
                </div>
                <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="download-btn">View/Download</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboard;
