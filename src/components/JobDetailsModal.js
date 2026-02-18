import React, { useState } from 'react';
import { updateJob, deleteJob, applyForJob } from '../services/jobService';
import { X, DollarSign, MapPin, Calendar } from 'lucide-react';
import '../styles/JobDetailsModal.css';

const JobDetailsModal = ({ job, onClose, onUpdated, currentUserId, currentUserType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(job ? { ...job } : null);
  const [loading, setLoading] = useState(false);

  if (!job) return null;

  const isOwner = currentUserType === 'employer' && (job.employerId === currentUserId || job.userId === currentUserId);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateJob(job._id || job.id, formData);
      alert('Job updated');
      setIsEditing(false);
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job?')) return;
    setLoading(true);
    try {
      await deleteJob(job._id || job.id);
      alert('Job deleted');
      onUpdated && onUpdated();
      onClose && onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUserId) {
      alert('Please login to apply');
      return;
    }
    setLoading(true);
    try {
      await applyForJob(job._id || job.id, { userId: currentUserId, coverLetter: '' });
      alert('Application submitted');
      onClose && onClose();
    } catch (err) {
      alert(err.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-details-backdrop">
      <div className="job-details-modal">
        <div className="job-details-header">
          <h2>{job.title}</h2>
          <button className="job-details-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="job-details-body">
          <div className="job-details-top">
            <div className="job-details-company">{job.company}</div>
            <div className="job-details-meta">
              <span><MapPin size={14} /> {job.location || job.city || 'Remote'}</span>
              <span><DollarSign size={14} /> {job.salary || 'Competitive'}</span>
              {job.experience && <span><Calendar size={14} /> {job.experience}</span>}
            </div>
          </div>

          {isEditing ? (
            <div className="job-edit-form-modal">
              <input value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
              <input value={formData.company || ''} onChange={(e) => handleChange('company', e.target.value)} />
              <input value={formData.location || ''} onChange={(e) => handleChange('location', e.target.value)} />
              <input value={formData.salary || ''} onChange={(e) => handleChange('salary', e.target.value)} />
              <textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
          ) : (
            <div className="job-details-description">
              <h4>Job Description</h4>
              <p>{job.description || 'No description provided.'}</p>
              {job.skills && job.skills.length > 0 && (
                <div className="job-details-skills">
                  {job.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="job-details-actions">
          {!isEditing && currentUserType === 'jobseeker' && (
            <button className="btn-apply" onClick={handleApply} disabled={loading}>Apply</button>
          )}
          {isOwner && !isEditing && (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          {isEditing && (
            <>
              <button className="btn-save" onClick={handleSave} disabled={loading}>Save</button>
              <button className="btn-cancel" onClick={() => { setIsEditing(false); setFormData({ ...job }); }}>Cancel</button>
            </>
          )}
          {isOwner && (
            <button className="btn-delete" onClick={handleDelete} disabled={loading}>Delete</button>
          )}
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
