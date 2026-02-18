import React, { useState } from 'react';
import { createJob } from '../services/jobService';
import { Briefcase, MapPin, DollarSign, Calendar, Users, FileText, X } from 'lucide-react';
import '../styles/JobPost.css';

const JobPost = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    jobType: 'Full-time',
    workMode: 'On-site',
    experience: '',
    salary: '₹50,000 - ₹100,000',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: '',
    openings: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert comma-separated strings to arrays
      const skillsArray = formData.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill);

      const requirementsArray = formData.requirements
        .split('\n')
        .map(req => req.trim())
        .filter(req => req);

      const responsibilitiesArray = formData.responsibilities
        .split('\n')
        .map(resp => resp.trim())
        .filter(resp => resp);

      const benefitsArray = formData.benefits
        .split('\n')
        .map(benefit => benefit.trim())
        .filter(benefit => benefit);

      // Parse location into city and state
      const locationParts = formData.location.split(',').map(p => p.trim());
      const city = locationParts[0] || formData.location;

      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        city: city,
        state: locationParts[1] || '',
        country: formData.country,
        jobType: formData.jobType,
        workMode: formData.workMode,
        experience: formData.experience,
        salary: formData.salary,
        description: formData.description,
        requirements: requirementsArray,
        responsibilities: responsibilitiesArray,
        benefits: benefitsArray,
        skills: skillsArray,
        employerId: userId,
      };

      await createJob(jobData);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-post-container">
      <div className="job-post-header">
        <div>
          <h2>Post a New Job</h2>
          <p>Fill in the details to post a job opportunity</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="close-btn">
            <X size={24} />
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="job-post-form">
        <div className="form-grid">
          {/* Job Title */}
          <div className="form-group full-width">
            <label>
              <Briefcase size={18} />
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Senior UX Designer"
              required
            />
          </div>

          {/* Company Name */}
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="e.g. Tech Corp"
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label>
              <MapPin size={18} />
              Location in India *
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a city</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Pune">Pune</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Surat">Surat</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Indore">Indore</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Remote (India)">Remote (India)</option>
            </select>
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label>Job Type *</label>
            <select name="jobType" value={formData.jobType} onChange={handleInputChange} required>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div className="form-group">
            <label>Work Mode *</label>
            <select name="workMode" value={formData.workMode} onChange={handleInputChange} required>
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Experience */}
          <div className="form-group">
            <label>
              <Calendar size={18} />
              Experience Required
            </label>
            <input
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="e.g. 3-5 years"
            />
          </div>

          {/* Salary */}
          <div className="form-group">
            <label>
              <DollarSign size={18} />
              Salary Range (INR) *
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="e.g. ₹5,00,000 - ₹8,00,000"
              required
            />
          </div>

          {/* Number of Openings */}
          <div className="form-group">
            <label>
              <Users size={18} />
              Number of Openings
            </label>
            <input
              type="number"
              name="openings"
              value={formData.openings}
              onChange={handleInputChange}
              min="1"
            />
          </div>

          {/* Skills */}
          <div className="form-group full-width">
            <label>Required Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="e.g. React, Node.js, MongoDB"
            />
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label>
              <FileText size={18} />
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              required
            />
          </div>

          {/* Requirements */}
          <div className="form-group full-width">
            <label>Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows="4"
              placeholder="List the requirements (one per line)"
            />
          </div>

          {/* Responsibilities */}
          <div className="form-group full-width">
            <label>Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleInputChange}
              rows="4"
              placeholder="List the key responsibilities (one per line)"
            />
          </div>

          {/* Benefits */}
          <div className="form-group full-width">
            <label>Benefits & Perks</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              rows="4"
              placeholder="List the benefits (one per line, e.g., Health insurance, Remote work, etc.)"
            />
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPost;
