import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../services/mongoAuthService';
import { getJobSeekerProfile, getEmployerProfile } from '../services/profileService';
import { getProfileCompletionStatus } from '../services/profileHelperService';
import JobSeekerProfileForm from '../components/JobSeekerProfileForm';
import EmployerProfileForm from '../components/EmployerProfileForm';
import ResumeUpload from '../components/ResumeUpload';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import '../styles/Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileSection, setShowProfileSection] = useState(false);

  // Debug: Log when showProfileSection changes
  useEffect(() => {
    console.log('showProfileSection changed to:', showProfileSection);
  }, [showProfileSection]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        if (userData && userData.uid) {
          // Fetch profile based on user type
          try {
            let profile;
            if (userData.userType === 'jobseeker') {
              profile = await getJobSeekerProfile(userData.uid);
            } else if (userData.userType === 'employer') {
              profile = await getEmployerProfile(userData.uid);
            }
            
            if (profile) {
              setProfileData(profile);
              const completion = getProfileCompletionStatus(profile, userData.userType);
              setProfileCompletion(completion.percentage);
            }
          } catch (profileError) {
            // Profile doesn't exist yet - this is normal for new users
            // Only log if it's a real error (not a 404)
            if (profileError.response?.status !== 404 && 
                !profileError.isExpected404 && 
                profileError.message !== 'Profile not found') {
              console.error('Error fetching profile:', profileError);
            }
            // Silently handle expected 404s - no logging needed
            setProfileCompletion(0);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileSave = async (savedProfile) => {
    setProfileData(savedProfile);
    const completion = getProfileCompletionStatus(savedProfile, user.userType);
    setProfileCompletion(completion.percentage);
    setIsEditingProfile(false);
    setShowProfileSection(true); // Keep profile section open after save
    
    // Refresh user data
    const updatedUser = await getCurrentUser();
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const isJobSeeker = user?.userType === 'jobseeker';
  const displayName = profileData 
    ? (isJobSeeker ? `${profileData.firstName} ${profileData.lastName}`.trim() : profileData.companyName)
    : user?.displayName || 'User';

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="nav-container">
          <div className="logo-section">
            <h2 className="logo">JobPortal</h2>
            <span className="tagline">Your Career Starts Here</span>
          </div>
          <div className="nav-actions">
            <div className="profile-menu-wrapper">
              <div className="profile-menu-wrapper-inner">
                <button
                  className="profile-clickable-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Profile photo/name clicked - opening profile section');
                    setShowProfileMenu(false);
                    setShowProfileSection(true);
                    setIsEditingProfile(false);
                    setActiveTab('overview');
                  }}
                  type="button"
                >
                  <div className="profile-avatar-small">
                    {profileData?.profilePhoto ? (
                      <img 
                        src={profileData.profilePhoto} 
                        alt="Profile" 
                        className="avatar-img-small"
                      />
                    ) : (
                      displayName?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span className="profile-name-clickable">{displayName.split(' ')[0] || 'User'}</span>
                </button>
                <button 
                  className="profile-dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  type="button"
                >
                  <span className="dropdown-arrow">▼</span>
                </button>
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {profileData?.profilePhoto ? (
                        <img 
                          src={profileData.profilePhoto} 
                          alt="Profile" 
                          className="avatar-img-dropdown"
                        />
                      ) : (
                        displayName?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">{displayName || 'User'}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-completion">
                        Profile: {profileCompletion}% Complete
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('View Profile clicked');
                      setShowProfileMenu(false);
                      setIsEditingProfile(false);
                      setShowProfileSection(true);
                      setActiveTab('overview');
                    }}
                  >
                    <span className="dropdown-icon">👤</span>
                    View Profile
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Edit Profile clicked');
                      setShowProfileMenu(false);
                      setIsEditingProfile(true);
                      setShowProfileSection(true);
                      setActiveTab('overview');
                    }}
                  >
                    <span className="dropdown-icon">✏️</span>
                    Edit Profile
                  </button>
                  {isJobSeeker && (
                    <button 
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Resume Management clicked');
                        setShowProfileMenu(false);
                        setShowProfileSection(true);
                        setIsEditingProfile(false);
                        setActiveTab('resume');
                      }}
                    >
                      <span className="dropdown-icon">📄</span>
                      Resume Management
                    </button>
                  )}
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Header with Stats */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1>Welcome back, <span className="highlight">{displayName.split(' ')[0] || 'User'}</span>!</h1>
            <p className="header-subtitle">Manage your career and opportunities</p>
          </div>
          <div className="quick-stats">
            {isJobSeeker ? (
              <>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Applications</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Saved Jobs</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <div className="stat-value">{profileCompletion}%</div>
                    <div className="stat-label">Profile</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Job Posts</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <div className="stat-value">0</div>
                    <div className="stat-label">Applications</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📈</div>
                  <div className="stat-content">
                    <div className="stat-value">{profileCompletion}%</div>
                    <div className="stat-label">Profile</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {!showProfileSection && (
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('overview');
                setShowProfileSection(false);
              }}
            >
              <span className="tab-icon">📊</span> Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('jobs');
                setShowProfileSection(false);
              }}
            >
              <span className="tab-icon">💼</span> Jobs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveTab('activity');
                setShowProfileSection(false);
              }}
            >
              <span className="tab-icon">🔔</span> Activity
            </button>
          </div>
        )}
        
        {/* Profile Section Header (when profile is open) */}
        {showProfileSection && (
          <div className="profile-section-header-nav">
            <button 
              className="profile-section-back-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Profile section back clicked');
                setShowProfileSection(false);
                setIsEditingProfile(false);
                setActiveTab('overview');
              }}
            >
              ← Back to Dashboard
            </button>
            <h2 className="profile-section-title">My Profile</h2>
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {showProfileSection ? (
            // Profile Section (shown when clicking profile photo/name)
            <div className="tab-pane active profile-pane-active">
              <div className="profile-section">
                {!isEditingProfile ? (
                  <>
                    {/* Profile Header */}
                    <div className="profile-header-section">
                      <div className="profile-header-avatar-wrapper">
                        <div className="profile-header-avatar">
                          {profileData?.profilePhoto ? (
                            <img 
                              src={profileData.profilePhoto} 
                              alt="Profile" 
                              className="avatar-img-large"
                            />
                          ) : (
                            displayName?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="profile-photo-edit-section">
                          <ProfilePhotoUpload
                            userId={user?.uid}
                            userType={user?.userType}
                            currentPhotoUrl={profileData?.profilePhoto}
                            onPhotoUpdate={(newPhoto) => {
                              setProfileData({ ...profileData, profilePhoto: newPhoto });
                            }}
                          />
                        </div>
                      </div>
                      <div className="profile-header-info">
                        <h2>{displayName || 'User'}</h2>
                        <p className="profile-header-subtitle">
                          {isJobSeeker 
                            ? (profileData?.headline || 'Job Seeker') 
                            : (profileData?.industry || 'Employer')}
                        </p>
                        {isJobSeeker && profileData?.currentCity && (
                          <p className="profile-header-location">
                            📍 {profileData.currentCity}{profileData.state ? `, ${profileData.state}` : ''}
                          </p>
                        )}
                        {!isJobSeeker && profileData?.city && (
                          <p className="profile-header-location">
                            📍 {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="profile-header-actions">
                        <button 
                          className="profile-edit-btn"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          ✏️ Edit Profile
                        </button>
                        <button 
                          className="profile-back-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Back to Dashboard clicked');
                            setShowProfileSection(false);
                            setIsEditingProfile(false);
                            setActiveTab('overview');
                          }}
                        >
                          ← Back to Dashboard
                        </button>
                      </div>
                    </div>

                    {/* Profile Summary with Completion */}
                    <div className="profile-summary-card">
                      <div className="profile-summary-header">
                        <div className="profile-summary-avatar-section">
                          <div className="profile-summary-avatar-large">
                            {profileData?.profilePhoto ? (
                              <img 
                                src={profileData.profilePhoto} 
                                alt="Profile" 
                                className="avatar-img-summary-large"
                              />
                            ) : (
                              displayName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="profile-summary-completion">
                            <div className="completion-circle-large">
                              <svg viewBox="0 0 36 36" className="circular-chart">
                                <path
                                  className="circle-bg"
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <path
                                  className="circle"
                                  strokeDasharray={`${profileCompletion}, 100`}
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                <text x="18" y="20.35" className="percentage">{profileCompletion}%</text>
                              </svg>
                            </div>
                            <p className="completion-label-large">Profile Complete</p>
                          </div>
                        </div>
                        <div className="profile-summary-details">
                          <h2>{displayName || 'User'}</h2>
                          <p className="profile-summary-subtitle">
                            {isJobSeeker 
                              ? (profileData?.headline || 'Job Seeker') 
                              : (profileData?.industry || 'Employer')}
                          </p>
                          {isJobSeeker && profileData?.currentCity && (
                            <p className="profile-summary-location">
                              📍 {profileData.currentCity}{profileData.state ? `, ${profileData.state}` : ''}
                            </p>
                          )}
                          {!isJobSeeker && profileData?.city && (
                            <p className="profile-summary-location">
                              📍 {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Account Details Card */}
                    <div className="user-info-card">
                      <div className="card-header">
                        <h3>Account Information</h3>
                      </div>
                      
                      <div className="info-section">
                        <div className="info-item">
                          <span className="label">📧 Email Address:</span>
                          <span className="value">
                            {user?.email || 'Loading...'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">💼 Account Type:</span>
                          <span className="value type-badge">
                            {user?.userType === 'jobseeker' ? '💼 Job Seeker' : user?.userType === 'employer' ? '🏢 Employer' : 'Unknown'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">📈 Profile Completion:</span>
                          <span className="value">
                            <span className={`completion-badge ${profileCompletion === 100 ? 'complete' : profileCompletion >= 50 ? 'in-progress' : 'incomplete'}`}>
                              {profileCompletion}%
                            </span>
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">⚙️ Account Status:</span>
                          <span className="value status-badge active">✓ Active & Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile View Mode */}
                    {isJobSeeker ? (
                      <div className="profile-content">
                        <div className="profile-card">
                          <h3>📋 Personal Information</h3>
                          <div className="profile-field">
                            <label>Full Name</label>
                            <div className="field-value">
                              {profileData?.firstName && profileData?.lastName 
                                ? `${profileData.firstName} ${profileData.lastName}` 
                                : 'Not provided'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Email Address</label>
                            <div className="field-value">{profileData?.email || user?.email || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Phone Number</label>
                            <div className="field-value">{profileData?.phoneNumber || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Location</label>
                            <div className="field-value">
                              {profileData?.currentCity 
                                ? `${profileData.currentCity}${profileData.state ? `, ${profileData.state}` : ''}${profileData.country ? `, ${profileData.country}` : ''}`
                                : 'Not provided'}
                            </div>
                          </div>
                        </div>

                        <div className="profile-card">
                          <h3>💼 Professional Information</h3>
                          <div className="profile-field">
                            <label>Professional Headline</label>
                            <div className={`field-value ${!profileData?.headline ? 'placeholder-text' : ''}`}>
                              {profileData?.headline || 'Add your professional headline'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Professional Summary</label>
                            <div className={`field-value ${!profileData?.professionalSummary ? 'placeholder-text' : ''}`}>
                              {profileData?.professionalSummary || 'Add your professional summary'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Years of Experience</label>
                            <div className="field-value">
                              {profileData?.experience !== undefined ? `${profileData.experience} years` : 'Not specified'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Expected Salary</label>
                            <div className="field-value">
                              {profileData?.salaryExpectation ? `$${profileData.salaryExpectation.toLocaleString()}/year` : 'Not specified'}
                            </div>
                          </div>
                        </div>

                        <div className="profile-card">
                          <h3>🎯 Skills & Preferences</h3>
                          <div className="profile-field">
                            <label>Skills</label>
                            <div className="field-value">
                              {profileData?.skills && profileData.skills.length > 0 ? (
                                <div className="skills-display">
                                  {profileData.skills.map((skill, index) => (
                                    <span key={index} className="skill-badge">{skill}</span>
                                  ))}
                                </div>
                              ) : (
                                <span className="placeholder-text">Add your skills</span>
                              )}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Preferred Job Types</label>
                            <div className="field-value">
                              {profileData?.preferredJobTypes && profileData.preferredJobTypes.length > 0 
                                ? profileData.preferredJobTypes.join(', ') 
                                : 'Not specified'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Willing to Relocate</label>
                            <div className="field-value">
                              {profileData?.willingToRelocate ? 'Yes' : 'No'}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Open to Work</label>
                            <div className="field-value">
                              {profileData?.openToWork !== false ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="profile-content">
                        <div className="profile-card">
                          <h3>🏢 Company Information</h3>
                          <div className="profile-field">
                            <label>Company Name</label>
                            <div className="field-value">{profileData?.companyName || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Industry</label>
                            <div className="field-value">{profileData?.industry || 'Not specified'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Company Size</label>
                            <div className="field-value">{profileData?.companySize || 'Not specified'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Founded Year</label>
                            <div className="field-value">{profileData?.foundedYear || 'Not specified'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Website</label>
                            <div className="field-value">
                              {profileData?.website ? (
                                <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="website-link">
                                  {profileData.website}
                                </a>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                          </div>
                          <div className="profile-field">
                            <label>Description</label>
                            <div className={`field-value ${!profileData?.companyDescription ? 'placeholder-text' : ''}`}>
                              {profileData?.companyDescription || 'Add your company description'}
                            </div>
                          </div>
                        </div>

                        <div className="profile-card">
                          <h3>📍 Contact Information</h3>
                          <div className="profile-field">
                            <label>Email Address</label>
                            <div className="field-value">{profileData?.email || user?.email || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Phone Number</label>
                            <div className="field-value">{profileData?.phoneNumber || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Contact Person</label>
                            <div className="field-value">{profileData?.contactPersonName || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Office Address</label>
                            <div className="field-value">
                              {profileData?.officeAddress 
                                ? `${profileData.officeAddress}, ${profileData.city || ''}${profileData.state ? `, ${profileData.state}` : ''}`
                                : 'Not provided'}
                            </div>
                          </div>
                        </div>

                        <div className="profile-card">
                          <h3>📄 Legal Information</h3>
                          <div className="profile-field">
                            <label>Registration Number</label>
                            <div className="field-value">{profileData?.registrationNumber || 'Not provided'}</div>
                          </div>
                          <div className="profile-field">
                            <label>Tax ID</label>
                            <div className="field-value">{profileData?.taxId || 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Profile Edit Mode
                  <div className="profile-edit-container">
                    <div className="edit-header">
                      <h2>✏️ Edit Your Profile</h2>
                      <div className="edit-header-actions">
                        <button 
                          className="btn-back"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Back to View clicked');
                            setIsEditingProfile(false);
                          }}
                        >
                          ← Back to View
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Cancel & Close clicked');
                            setIsEditingProfile(false);
                            setShowProfileSection(false);
                            setActiveTab('overview');
                          }}
                        >
                          Cancel & Close
                        </button>
                      </div>
                    </div>
                    {isJobSeeker ? (
                      <JobSeekerProfileForm 
                        userId={user?.uid} 
                        onSave={handleProfileSave}
                      />
                    ) : (
                      <EmployerProfileForm 
                        userId={user?.uid}
                        onSave={handleProfileSave}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'overview' && !showProfileSection && (
            <div className="tab-pane active">
              <div className="welcome-section">
                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="actions-grid">
                    {isJobSeeker ? (
                      <>
                        <button className="action-btn primary">
                          <span className="action-icon">🔍</span>
                          <span>Browse Jobs</span>
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => { 
                            setShowProfileMenu(false);
                            setIsEditingProfile(true);
                            setShowProfileSection(true);
                            setActiveTab('overview');
                          }}
                        >
                          <span className="action-icon">✏️</span>
                          <span>Edit Profile</span>
                        </button>
                        <button className="action-btn secondary">
                          <span className="action-icon">⭐</span>
                          <span>Saved Jobs</span>
                        </button>
                        <button className="action-btn secondary">
                          <span className="action-icon">📊</span>
                          <span>My Applications</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn primary">
                          <span className="action-icon">✍️</span>
                          <span>Post a Job</span>
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => { 
                            setShowProfileMenu(false);
                            setIsEditingProfile(true);
                            setShowProfileSection(true);
                            setActiveTab('overview');
                          }}
                        >
                          <span className="action-icon">✏️</span>
                          <span>Edit Profile</span>
                        </button>
                        <button className="action-btn secondary">
                          <span className="action-icon">📋</span>
                          <span>My Listings</span>
                        </button>
                        <button className="action-btn secondary">
                          <span className="action-icon">👥</span>
                          <span>View Candidates</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Recent Activity Summary */}
                <div className="overview-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-cards-grid">
                    <div className="activity-mini-card">
                      <div className="mini-card-icon">📝</div>
                      <div className="mini-card-content">
                        <p className="mini-card-title">Profile Updates</p>
                        <p className="mini-card-value">0</p>
                      </div>
                    </div>
                    <div className="activity-mini-card">
                      <div className="mini-card-icon">👁️</div>
                      <div className="mini-card-content">
                        <p className="mini-card-title">Profile Views</p>
                        <p className="mini-card-value">0</p>
                      </div>
                    </div>
                    <div className="activity-mini-card">
                      <div className="mini-card-icon">🔔</div>
                      <div className="mini-card-content">
                        <p className="mini-card-title">Notifications</p>
                        <p className="mini-card-value">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && !showProfileSection && (
            <div className="tab-pane active">
              <div className="jobs-section">
                <h2>{isJobSeeker ? 'Browse Jobs' : 'Manage Job Listings'}</h2>
                <div className="jobs-placeholder">
                  <div className="placeholder-card">
                    <span className="placeholder-icon">💼</span>
                    <p>{isJobSeeker ? 'No jobs available yet' : 'No job listings yet'}</p>
                    <p className="placeholder-subtext">
                      {isJobSeeker 
                        ? 'Job listings will appear here once employers start posting'
                        : 'Create your first job listing to get started'}
                    </p>
                    {!isJobSeeker && (
                      <button className="btn-primary" style={{ marginTop: '1rem' }}>
                        Post a Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resume' && isJobSeeker && showProfileSection && (
            <div className="tab-pane active">
              <div className="resume-section">
                <div className="resume-section-header">
                  <h2>Resume Management</h2>
                  <button 
                    className="profile-back-btn"
                    onClick={() => {
                      setShowProfileSection(false);
                      setActiveTab('overview');
                    }}
                  >
                    ← Back to Dashboard
                  </button>
                </div>
                <ResumeUpload userId={user?.uid} />
              </div>
            </div>
          )}

          {activeTab === 'activity' && !showProfileSection && (
            <div className="tab-pane active">
              <div className="activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-placeholder">
                  <div className="placeholder-card">
                    <span className="placeholder-icon">🔔</span>
                    <p>No recent activity</p>
                    <p className="placeholder-subtext">Your activities will appear here once you start using the platform</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showProfileMenu && (
        <div 
          className="profile-menu-overlay"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowProfileMenu(false);
          }}
        ></div>
      )}
    </div>
  );
}

export default Dashboard;
