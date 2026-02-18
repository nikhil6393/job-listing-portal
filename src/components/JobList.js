import React, { useState, useEffect, useCallback } from 'react';
import { getJobs, applyForJob, updateJob, deleteJob } from '../services/jobService';
import { Briefcase, MapPin, DollarSign, Calendar, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import '../styles/JobList.css';
import JobDetailsModal from './JobDetailsModal';

const JobList = ({ userId, userType }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ jobType: '', workMode: '', search: '' });
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobData, setEditingJobData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const jobsData = await getJobs(filter);
      setJobs(jobsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId) => {
    try {
      await applyForJob(jobId, { userId, coverLetter: '' });
      alert('Application submitted successfully!');
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job._id || job.id);
    setEditingJobData({ ...job });
  };

  const handleEditChange = (field, value) => {
    setEditingJobData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editingJobId || !editingJobData) return;
    try {
      await updateJob(editingJobId, editingJobData);
      alert('Job updated successfully');
      setEditingJobId(null);
      setEditingJobData(null);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to update job');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    setIsDeleting(true);
    try {
      await deleteJob(jobId);
      alert('Job deleted');
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleSearch = () => {
    fetchJobs();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2>Browse Jobs</h2>
        <p>Find your next opportunity</p>
      </div>

      {/* Filters */}
      <div className="job-filters">
        <input
          type="text"
          name="search"
          value={filter.search}
          onChange={handleFilterChange}
          placeholder="Search jobs..."
          className="search-input"
        />
        <select name="jobType" value={filter.jobType} onChange={handleFilterChange}>
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Internship">Internship</option>
        </select>
        <select name="workMode" value={filter.workMode} onChange={handleFilterChange}>
          <option value="">All Work Modes</option>
          <option value="On-site">On-site</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <button onClick={handleSearch} className="btn-search">Search</button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Job Listings */}
      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <Briefcase size={48} />
            <p>No jobs found</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id || job.id} className="job-card">
              <div className="job-card-header">
                <div className="job-company-logo">
                  {job.company?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="job-type-badge">{job.jobType}</div>
              </div>
              
              <h3>{job.title}</h3>
              <p className="job-company">{job.company}</p>
              
              <div className="job-meta">
                <span>
                  <MapPin size={16} />
                  {job.location || `${job.city || 'India'}${job.state ? ', ' + job.state : ''}`}
                </span>
                <span>
                  <DollarSign size={16} />
                  {job.salary ? (job.salary.replace('?', '').includes('₹') ? job.salary.replace('?', '') : `₹${job.salary.replace('?', '')}`) : '₹Competitive'}
                </span>
                {job.experience && (
                  <span>
                    <Calendar size={16} />
                    {job.experience}
                  </span>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="job-skills">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="skill-tag">+{job.skills.length - 3}</span>
                  )}
                </div>
              )}
              {/* If this job is being edited, show edit form */}
              {editingJobId === (job._id || job.id) ? (
                <div className="job-edit-form">
                  <input type="text" value={editingJobData.title || ''} onChange={(e) => handleEditChange('title', e.target.value)} />
                  <input type="text" value={editingJobData.company || ''} onChange={(e) => handleEditChange('company', e.target.value)} />
                  <input type="text" value={editingJobData.location || ''} onChange={(e) => handleEditChange('location', e.target.value)} />
                  <input type="text" value={editingJobData.salary || ''} onChange={(e) => handleEditChange('salary', e.target.value)} />
                  <select value={editingJobData.jobType || ''} onChange={(e) => handleEditChange('jobType', e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                  <select value={editingJobData.workMode || ''} onChange={(e) => handleEditChange('workMode', e.target.value)}>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <textarea value={editingJobData.description || ''} onChange={(e) => handleEditChange('description', e.target.value)} />
                  <div className="job-edit-actions">
                    <button onClick={handleSaveEdit} className="btn-save">Save</button>
                    <button onClick={() => { setEditingJobId(null); setEditingJobData(null); }} className="btn-cancel">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="job-footer">
                  <span className="job-posted">
                    <Clock size={14} />
                    {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  {userType === 'jobseeker' && (
                    <button onClick={() => handleApply(job._id || job.id)} className="btn-apply">
                      Apply Now
                    </button>
                  )}

                  <button className="btn-details" onClick={() => setSelectedJob(job)}><Eye size={16} />See Details</button>

                  {/* Employer actions: edit/delete for owner's jobs */}
                  {userType === 'employer' && (job.employerId === userId || job.employerId === job.userId) && (
                    <div className="employer-actions">
                      <button onClick={() => handleEditClick(job)} className="btn-edit"><Edit2 size={15} />Edit</button>
                      <button onClick={() => handleDelete(job._id || job.id)} className="btn-delete" disabled={isDeleting}><Trash2 size={15} />{isDeleting ? 'Deleting...' : 'Delete'}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdated={fetchJobs}
          currentUserId={userId}
          currentUserType={userType}
        />
      )}
    </div>
  );
};

export default JobList;
