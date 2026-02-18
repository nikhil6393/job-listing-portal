import React, { useState, useEffect } from 'react';
import {
  createJobSeekerProfile,
  getJobSeekerProfile,
} from '../services/profileService';
import { validateJobSeekerProfile } from '../services/validationService';
import {
  getProfileCompletionStatus,
  getJobTypeOptions,
  getCountriesOptions,
} from '../services/profileHelperService';
import '../styles/ProfileForm.css';

const JobSeekerProfileForm = ({ userId, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    currentCity: '',
    state: '',
    zipCode: '',
    country: '',
    address: '',
    headline: '',
    professionalSummary: '',
    experience: 0,
    skills: [],
    preferredJobTypes: [],
    preferredLocations: [],
    salaryExpectation: '',
    willingToRelocate: false,
    openToWork: true,
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [completion, setCompletion] = useState(0);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getJobSeekerProfile(userId);
        // Only update formData if profile exists
        if (profile) {
          // Ensure all fields have default values to prevent controlled/uncontrolled warning
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            dateOfBirth: profile.dateOfBirth || '',
            gender: profile.gender || '',
            currentCity: profile.currentCity || '',
            state: profile.state || '',
            zipCode: profile.zipCode || '',
            country: profile.country || '',
            address: profile.address || '',
            headline: profile.headline || '',
            professionalSummary: profile.professionalSummary || '',
            experience: profile.experience || 0,
            skills: profile.skills || [],
            preferredJobTypes: profile.preferredJobTypes || [],
            preferredLocations: profile.preferredLocations || [],
            salaryExpectation: profile.salaryExpectation || '',
            willingToRelocate: profile.willingToRelocate || false,
            openToWork: profile.openToWork !== undefined ? profile.openToWork : true,
          });
          const status = getProfileCompletionStatus(profile, 'jobseeker');
          setCompletion(status.percentage);
        } else {
          console.log('New profile - starting fresh');
          // Profile doesn't exist yet, keep initial formData
        }
      } catch (error) {
        console.log('Error loading profile:', error.message);
        // Keep initial formData on error
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleJobTypeToggle = (jobType) => {
    setFormData({
      ...formData,
      preferredJobTypes: formData.preferredJobTypes.includes(jobType)
        ? formData.preferredJobTypes.filter((jt) => jt !== jobType)
        : [...formData.preferredJobTypes, jobType],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Validate
      const validation = validateJobSeekerProfile(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Save profile
      const savedProfile = await createJobSeekerProfile(userId, formData);

      // Update completion status
      const status = getProfileCompletionStatus(savedProfile, 'jobseeker');
      setCompletion(status.percentage);

      setSuccess(true);
      if (onSave) {
        onSave(savedProfile);
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-container job-seeker-form">
      <div className="profile-header">
        <h2>Job Seeker Profile</h2>
        <div className="completion-bar">
          <div className="completion-text">Profile Completion: {completion}%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completion}%` }}></div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-box">
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {success && (
        <div className="success-message">✓ Profile saved successfully!</div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Personal Information Section */}
        <fieldset className="form-section">
          <legend>Personal Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1-555-0123"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Contact Information Section */}
        <fieldset className="form-section">
          <legend>Contact Information</legend>

          <div className="form-group full-width">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              autoComplete="street-address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main Street"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentCity">City *</label>
              <input
                type="text"
                id="currentCity"
                name="currentCity"
                autoComplete="address-level2"
                value={formData.currentCity}
                onChange={handleInputChange}
                placeholder="San Francisco"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                autoComplete="address-level1"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="California"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zipCode">Zip Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                autoComplete="postal-code"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="94102"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="">Select Country</option>
                {getCountriesOptions().map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Professional Information Section */}
        <fieldset className="form-section">
          <legend>Professional Information</legend>

          <div className="form-group full-width">
            <label htmlFor="headline">Professional Headline *</label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              placeholder="e.g., Senior Full Stack Developer"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="professionalSummary">Professional Summary</label>
            <textarea
              id="professionalSummary"
              name="professionalSummary"
              value={formData.professionalSummary}
              onChange={handleInputChange}
              placeholder="Tell employers about yourself..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experience">Years of Experience</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="60"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salaryExpectation">Expected Salary (Annual)</label>
              <input
                type="number"
                id="salaryExpectation"
                name="salaryExpectation"
                value={formData.salaryExpectation}
                onChange={handleInputChange}
                placeholder="100000"
                min="0"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="form-group full-width">
            <label htmlFor="skillInput">Skills</label>
            <div className="skill-input-group">
              <input
                type="text"
                id="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddSkill}
              >
                Add Skill
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className="skills-list">
                {formData.skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      className="remove-skill"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </fieldset>

        {/* Job Preferences Section */}
        <fieldset className="form-section">
          <legend>Job Preferences</legend>

          <div className="form-group full-width">
            <label>Preferred Job Types</label>
            <div className="checkbox-group">
              {getJobTypeOptions().map((jobType) => (
                <label key={jobType} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.preferredJobTypes.includes(jobType)}
                    onChange={() => handleJobTypeToggle(jobType)}
                  />
                  {jobType}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-full">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="willingToRelocate"
                  checked={formData.willingToRelocate}
                  onChange={handleInputChange}
                />
                Willing to Relocate
              </label>
            </div>

            <div className="form-group checkbox-full">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="openToWork"
                  checked={formData.openToWork}
                  onChange={handleInputChange}
                />
                Open to Work
              </label>
            </div>
          </div>
        </fieldset>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobSeekerProfileForm;
