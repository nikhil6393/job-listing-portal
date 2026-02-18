import React, { useState, useEffect, useCallback } from 'react';
import { getUserApplications, updateApplicationStatus, getEmployerApplications } from '../services/jobService';
import { Briefcase, MapPin, DollarSign, Clock, FileText } from 'lucide-react';
import '../styles/JobApplications.css';

const JobApplications = ({ userId, userType }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (userType === 'jobseeker') {
        const data = await getUserApplications();
        setApplications(data);
      } else if (userType === 'employer') {
        // Fetch all applications for employer's jobs
        const data = await getEmployerApplications();
        setApplications(data);
      }
    } catch (err) {
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [userType]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      fetchApplications();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredApplications = filterStatus === 'all' 
    ? applications 
    : applications.filter(app => app.status === filterStatus);

  const getStatusColor = (status) => {
    const colors = {
      applied: '#FFA502',
      reviewed: '#0984E3',
      shortlisted: '#00B894',
      rejected: '#d63031',
      selected: '#6C5CE7'
    };
    return colors[status] || '#888';
  };

  const getStatusIcon = (status) => {
    if (status === 'selected') return '✓';
    if (status === 'rejected') return '✕';
    return '•';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (userType === 'jobseeker') {
    return (
      <div className="applications-container">
        <div className="applications-header">
          <h2>My Applications</h2>
          <p>Track your job applications and their status</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="app-filter-tabs">
          <button 
            className={`app-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({applications.length})
          </button>
          <button 
            className={`app-tab ${filterStatus === 'applied' ? 'active' : ''}`}
            onClick={() => setFilterStatus('applied')}
          >
            Applied
          </button>
          <button 
            className={`app-tab ${filterStatus === 'reviewed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('reviewed')}
          >
            Reviewed
          </button>
          <button 
            className={`app-tab ${filterStatus === 'shortlisted' ? 'active' : ''}`}
            onClick={() => setFilterStatus('shortlisted')}
          >
            Shortlisted
          </button>
          <button 
            className={`app-tab ${filterStatus === 'selected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('selected')}
          >
            Selected
          </button>
          <button 
            className={`app-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilterStatus('rejected')}
          >
            Rejected
          </button>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <Briefcase size={48} />
              <p>No applications yet</p>
              <small>Apply for jobs to see them here</small>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="application-job">
                    <h3>{application.jobId?.title}</h3>
                    <p className="application-company">{application.jobId?.company}</p>
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {getStatusIcon(application.status)} {application.status.toUpperCase()}
                  </span>
                </div>

                <div className="application-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    {application.jobId?.location}
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    {application.jobId?.salary ? (application.jobId.salary.replace('?', '').includes('₹') ? application.jobId.salary.replace('?', '') : `₹${application.jobId.salary.replace('?', '')}`) : '₹Competitive'}
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="application-cover-letter">
                    <FileText size={14} />
                    <p>{application.coverLetter.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Employer view - show all received applications
  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>Candidate Applications</h2>
        <p>Manage applications for your job postings</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="app-filter-tabs">
        <button 
          className={`app-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All ({applications.length})
        </button>
        <button 
          className={`app-tab ${filterStatus === 'applied' ? 'active' : ''}`}
          onClick={() => setFilterStatus('applied')}
        >
          Applied
        </button>
        <button 
          className={`app-tab ${filterStatus === 'reviewed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('reviewed')}
        >
          Reviewed
        </button>
        <button 
          className={`app-tab ${filterStatus === 'shortlisted' ? 'active' : ''}`}
          onClick={() => setFilterStatus('shortlisted')}
        >
          Shortlisted
        </button>
        <button 
          className={`app-tab ${filterStatus === 'selected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('selected')}
        >
          Selected
        </button>
        <button 
          className={`app-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <Briefcase size={48} />
            <p>No applications yet</p>
            <small>Applications will appear here when candidates apply for your jobs</small>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application._id} className="application-card">
              <div className="application-header">
                <div className="application-job">
                  <h3>{application.jobId?.title}</h3>
                  <p className="application-company">{application.candidateName}</p>
                </div>
                <select 
                  value={application.status}
                  onChange={(e) => handleStatusChange(application._id, e.target.value)}
                  style={{ 
                    backgroundColor: getStatusColor(application.status),
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <option value="applied">Applied</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="selected">Selected</option>
                </select>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <strong>Email:</strong> {application.candidateEmail}
                </div>
                <div className="detail-item">
                  <MapPin size={16} />
                  Job: {application.jobId?.company}
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  Applied {new Date(application.appliedAt).toLocaleDateString()}
                </div>
              </div>

              {application.coverLetter && (
                <div className="application-cover-letter">
                  <FileText size={14} />
                  <p>{application.coverLetter}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobApplications;
