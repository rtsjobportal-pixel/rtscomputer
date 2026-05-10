import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (app) => {
    // Opens a new window for printing the candidate details
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Candidate Details - ${app.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #333; }
            .detail { margin-bottom: 10px; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Candidate Details</h2>
          <div class="detail"><span class="label">Full Name:</span> ${app.full_name}</div>
          <div class="detail"><span class="label">Job Position:</span> ${app.job_position || app.candidate_id || 'N/A'}</div>
          <div class="detail"><span class="label">Email:</span> ${app.email}</div>
          <div class="detail"><span class="label">Submission Date:</span> ${new Date(app.submitted_at).toLocaleString()}</div>
          <div class="detail"><span class="label">Resume Link:</span> <a href="${app.resume_url}">${app.file_name}</a></div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintResume = (app) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Resume - ${app.full_name}</title>
          <style>
            body, html { margin: 0; padding: 0; height: 100%; }
            iframe { width: 100%; height: 90vh; border: none; }
            .print-header { padding: 15px; text-align: center; background: #f3f4f6; font-family: sans-serif; }
            button { padding: 10px 20px; font-size: 16px; cursor: pointer; background: #4f46e5; color: white; border: none; border-radius: 5px; }
            @media print { .print-header { display: none; } iframe { height: 100vh; } }
          </style>
        </head>
        <body>
          <div class="print-header">
            <button onclick="window.print()">Print This Document</button>
            <p>If printing fails to capture the document, please use your browser's native print (Ctrl+P / Cmd+P) or download the file.</p>
          </div>
          <iframe src="${app.resume_url}"></iframe>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="loading-screen">Loading applications...</div>;
  }

  return (
    <div className="dashboard-container admin-dashboard">
      <h2>Admin Dashboard</h2>
      <p>Manage all candidate applications for RTS Computer.</p>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job Position</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Submitted At</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No applications found.</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td>{app.job_position || app.candidate_id || 'N/A'}</td>
                  <td>{app.full_name}</td>
                  <td>{app.email}</td>
                  <td>{new Date(app.submitted_at).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handlePrintResume(app)} className="link-btn" style={{ border: 'none', cursor: 'pointer' }}>View & Print</button>
                  </td>
                  <td>
                    <button onClick={() => handlePrint(app)} className="print-btn">Print Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
