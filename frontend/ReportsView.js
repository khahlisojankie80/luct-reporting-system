import React, { useState, useEffect } from 'react';
import './ReportsView.css'; // Create this CSS file for styling

const ReportsView = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    course: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    loadReports();
  }, [user.role, filters, currentPage]);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/reports?`;
      if (user.role === 'lecturer') url += `lecturer_id=${user.id}&`;
      else if (user.role === 'prl') url += `faculty=FICT&`;
      else if (user.role === 'pl') url += `program=${user.program_id || 'ICT'}&`;

      if (filters.date) url += `date=${filters.date}&`;
      if (filters.course) url += `course=${filters.course}&`;
      if (filters.status) url += `status=${filters.status}&`;
      url += `page=${currentPage}&limit=${reportsPerPage}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        setError('Failed to load reports');
      }
    } catch (error) {
      setError('Error loading reports: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleFeedback = async (reportId, feedback) => {
    if (!feedback) {
      setError('Feedback is required');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ report_id: reportId, feedback, role: user.role }),
      });
      if (response.ok) {
        alert('Feedback submitted successfully!');
        loadReports();
      } else {
        setError('Failed to submit feedback');
      }
    } catch (error) {
      setError('Error submitting feedback: ' + error.message);
    }
  };

  const handleApprove = async (reportId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ report_id: reportId, status, role: user.role }),
      });
      if (response.ok) {
        alert('Report status updated successfully!');
        loadReports();
      } else {
        setError('Failed to update status');
      }
    } catch (error) {
      setError('Error updating status: ' + error.message);
    }
  };

  const downloadCSV = () => {
    const csv = [
      ['Date', 'Course', 'Attendance Rate', 'Status', 'Feedback'],
      ...reports.map(report => [
        report.lecture_date,
        report.course_name,
        `${(report.students_present / report.total_registered_students * 100).toFixed(1)}%`,
        report.status || 'Pending',
        report.feedback || '',
      ]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  if (loading) return <div className="reports-view"><h2>Loading...</h2></div>;
  if (error) return <div className="reports-view"><p className="error">{error}</p></div>;

  return (
    <div className="reports-view">
      <div className="view-header">
        <h2>📈 View Reports</h2>
        <p>Review and manage submitted lecture reports</p>
      </div>

      <details className="filter-section" open>
        <summary>Advanced Filters</summary>
        <div className="filter-row">
          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="filter-group">
            <label>Course</label>
            <input
              type="text"
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              placeholder="e.g., DIWA2110"
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </details>

      <div className="reports-list">
        {currentReports.length > 0 ? (
          currentReports.map(report => (
            <div key={report.id} className="report-item">
              <div className="report-details">
                <strong>{report.lecture_date}</strong> - {report.course_name} ({report.course_code})
                <div>Attendance: {report.students_present}/{report.total_registered_students} ({(report.students_present / report.total_registered_students * 100).toFixed(1)}%)</div>
                <div>Status: {report.status || 'Pending'}</div>
                {report.feedback && <div>Feedback: {report.feedback}</div>}
              </div>
              {(user.role === 'prl' || user.role === 'pl') && (
                <div className="report-actions">
                  <textarea
                    placeholder="Add feedback..."
                    onBlur={(e) => handleFeedback(report.id, e.target.value)}
                  />
                  <select
                    onChange={(e) => handleApprove(report.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Change Status</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                  </select>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No reports found.</p>
        )}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => paginate(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </div>

      <div className="view-actions">
        <button onClick={downloadCSV} className="download-btn">📥 Download CSV</button>
      </div>
    </div>
  );
};

export default ReportsView;