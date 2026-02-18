import React, { useState, useEffect } from 'react';
import {
  createEmployerProfile,
  getEmployerProfile,
} from '../services/profileService';
import { validateEmployerProfile } from '../services/validationService';
import {
  getProfileCompletionStatus,
  getCompanySizeOptions,
  getIndustryOptions,
  getCountriesOptions,
} from '../services/profileHelperService';
import '../styles/ProfileForm.css';

const EmployerProfileForm = ({ userId, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyType: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    companyDescription: '',
    contactPersonName: '',
    email: '',
    phoneNumber: '',
    alternatePhone: '',
    officeAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    registrationNumber: '',
    taxId: '',
  });

  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completion, setCompletion] = useState(0);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getEmployerProfile(userId);
        if (profile) {
          // Ensure all fields have default values to prevent controlled/uncontrolled warning
          setFormData({
            companyName: profile.companyName || '',
            companyType: profile.companyType || '',
            industry: profile.industry || '',
            companySize: profile.companySize || '',
            foundedYear: profile.foundedYear || '',
            website: profile.website || '',
            companyDescription: profile.companyDescription || '',
            contactPersonName: profile.contactPersonName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            alternatePhone: profile.alternatePhone || '',
            officeAddress: profile.officeAddress || '',
            city: profile.city || '',
            state: profile.state || '',
            zipCode: profile.zipCode || '',
            country: profile.country || '',
            registrationNumber: profile.registrationNumber || '',
            taxId: profile.taxId || '',
          });
          const status = getProfileCompletionStatus(profile, 'employer');
          setCompletion(status.percentage);
        }
      } catch (error) {
        console.log('New profile - starting fresh');
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Validate
      const validation = validateEmployerProfile(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Save profile
      const savedProfile = await createEmployerProfile(userId, formData);

      // Update completion status
      const status = getProfileCompletionStatus(savedProfile, 'employer');
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
    <div className="profile-form-container employer-form">
      <div className="profile-header">
        <h2>Employer Profile</h2>
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
        {/* Company Information Section */}
        <fieldset className="form-section">
          <legend>Company Information</legend>

          <div className="form-group full-width">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="industry">Industry *</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Industry</option>
                {getIndustryOptions().map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="companySize">Company Size *</label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Company Size</option>
                {getCompanySizeOptions().map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="companyType">Company Type</label>
              <input
                type="text"
                id="companyType"
                name="companyType"
                value={formData.companyType}
                onChange={handleInputChange}
                placeholder="e.g., Private, Public, Startup"
              />
            </div>

            <div className="form-group">
              <label htmlFor="foundedYear">Founded Year</label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleInputChange}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="website">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="companyDescription">Company Description</label>
            <textarea
              id="companyDescription"
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleInputChange}
              placeholder="Tell job seekers about your company..."
              rows="4"
            />
          </div>
        </fieldset>

        {/* Contact Information Section */}
        <fieldset className="form-section">
          <legend>Contact Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactPersonName">Contact Person Name</label>
              <input
                type="text"
                id="contactPersonName"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1-555-0100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="alternatePhone">Alternate Phone</label>
              <input
                type="tel"
                id="alternatePhone"
                name="alternatePhone"
                autoComplete="tel"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                placeholder="+1-555-0101"
              />
            </div>
          </div>
        </fieldset>

        {/* Address Information Section */}
        <fieldset className="form-section">
          <legend>Office Address</legend>

          <div className="form-group full-width">
            <label htmlFor="officeAddress">Street Address</label>
            <input
              type="text"
              id="officeAddress"
              name="officeAddress"
              autoComplete="street-address"
              value={formData.officeAddress}
              onChange={handleInputChange}
              placeholder="123 Business Street"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="San Francisco"
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

        {/* Legal Information Section */}
        <fieldset className="form-section">
          <legend>Legal Information</legend>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="registrationNumber">Registration/CRN Number</label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="CRN or Registration Number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxId">Tax ID</label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder="Tax Identification Number"
              />
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

export default EmployerProfileForm;
