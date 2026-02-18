import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, getCurrentUser } from '../services/mongoAuthService';
import { getJobSeekerProfile, getEmployerProfile } from '../services/profileService';
import { getJobs, getEmployerJobs, getApplicationStats, getEmployerStats } from '../services/jobService';
import { 
  Menu, X, Search, Bell, User, ChevronDown, Briefcase, 
  Calendar, Users, MapPin, DollarSign, TrendingUp, Eye,
  Settings, LayoutDashboard, UserCircle, PlusCircle, FileText, Inbox
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogoIcon } from '../components/CareerHubLogo';
import JobSeekerProfileForm from '../components/JobSeekerProfileForm';
import EmployerProfileForm from '../components/EmployerProfileForm';
import JobPost from '../components/JobPost';
import JobList from '../components/JobList';
import JobApplications from '../components/JobApplications';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';
import ResumeUpload from '../components/ResumeUpload';
import JobDetailsModal from '../components/JobDetailsModal';
import '../styles/ProfessionalDashboard.css';

function ProfessionalDashboard() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, profile, jobs, postJob, myJobs, applications
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [triggerPhotoUpload, setTriggerPhotoUpload] = useState(false);
  const [selectedRecommendedJob, setSelectedRecommendedJob] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = React.useRef(null);

  // Function to fetch recommended jobs from backend
  const fetchRecommendedJobs = async () => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const jobs = await getJobs({ limit: 4 });
      setRecommendedJobs(jobs);
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
      setJobsError('Failed to load recommended jobs');
      setRecommendedJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  // Function to fetch employer's jobs (stub for future implementation)
  const fetchEmployerJobs = async (employerId) => {
    try {
      await getEmployerJobs(employerId);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
    }
  };

  // Function to fetch vacancy/application stats
  const fetchVacancyStats = async (userType) => {
    setStatsLoading(true);
    try {
      let stats;
      if (userType === 'jobseeker') {
        stats = await getApplicationStats();
      } else if (userType === 'employer') {
        stats = await getEmployerStats();
      }
      setChartData(stats || getDefaultChartData());
    } catch (error) {
      console.error('Error fetching stats:', error);
      setChartData(getDefaultChartData());
    } finally {
      setStatsLoading(false);
    }
  };

  // Default mock data for fallback
  const getDefaultChartData = () => [
    { name: 'Jan', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'Feb', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'Mar', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'Apr', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'May', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'Jun', applicationSent: 0, interviews: 0, rejected: 0 },
    { name: 'Jul', applicationSent: 0, interviews: 0, rejected: 0 },
  ];

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Fetch profile data
        if (userData && userData.uid) {
          try {
            let profile;
            if (userData.userType === 'jobseeker') {
              profile = await getJobSeekerProfile(userData.uid);
            } else if (userData.userType === 'employer') {
              profile = await getEmployerProfile(userData.uid);
            }
            if (profile) {
              setProfileData(profile);
            }
          } catch (profileError) {
            if (profileError.response?.status !== 404 && !profileError.isExpected404) {
              console.error('Error fetching profile:', profileError);
            }
          }

          // Fetch employer jobs if employer
          if (userData.userType === 'employer') {
            await fetchEmployerJobs(userData.uid);
          }
        }

        // Fetch recommended jobs
        await fetchRecommendedJobs();
        
        // Fetch vacancy/application stats
        await fetchVacancyStats(userData.userType);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
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
  const displayName = (() => {
    if (profileData) {
      if (isJobSeeker) {
        const firstName = profileData.firstName || '';
        const lastName = profileData.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || user?.displayName || 'User';
      } else {
        return profileData.companyName || user?.displayName || 'Company';
      }
    }
    return user?.displayName || 'User';
  })();

  const handleProfileSave = async (savedProfile) => {
    setProfileData(savedProfile);
    setIsEditingProfile(false);
    // Keep profile view open after save
    // Refresh user data
    const updatedUser = await getCurrentUser();
    setUser(updatedUser);
  };

  const handleJobPostSuccess = () => {
    // Refresh employer jobs and recommended jobs
    if (user?.uid && !isJobSeeker) {
      fetchEmployerJobs(user.uid);
    }
    fetchRecommendedJobs();
    setActiveView('jobs');
  };

  

  return (
    <div className="prof-dashboard">
      {/* Sidebar */}
      <aside className={`prof-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="prof-sidebar-header">
          <div className="prof-brand">
            <div className="prof-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoIcon size={32} />
            </div>
            <div className="prof-brand-text">
              <h2>CareerHub</h2>
              <span>Career Platform</span>
            </div>
          </div>
        </div>
        
        <nav className="prof-nav">
          <button 
            className={`prof-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`prof-nav-item ${activeView === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveView('jobs')}
          >
            <Briefcase size={20} />
            <span>Browse Jobs</span>
          </button>
          
          <button 
            className={`prof-nav-item ${activeView === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveView('applications')}
          >
            <Inbox size={20} />
            <span>Applications</span>
          </button>

          {!isJobSeeker && (
            <>
              <button 
                className={`prof-nav-item ${activeView === 'postJob' ? 'active' : ''}`}
                onClick={() => setActiveView('postJob')}
              >
                <PlusCircle size={20} />
                <span>Post Job</span>
              </button>
            </>
          )}

        </nav>
      </aside>

      {/* Main Content */}
      <div className="prof-main">
        {/* Top Header */}
        <header className="prof-header">
          <div className="prof-header-left">
            <button className="prof-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1>Dashboard</h1>
          </div>
          
          <div className="prof-header-center">
            <div className="prof-search">
              <Search size={18} />
              <input type="text" placeholder="Search here..." />
            </div>
          </div>
          
          <div className="prof-header-right">
            <button className="prof-icon-btn">
              <Bell size={20} />
              <span className="prof-badge">5</span>
            </button>
            <div className={`prof-user-menu-wrapper ${showProfileMenu ? 'active' : ''}`} ref={dropdownRef}>
              <div 
                className="prof-user-menu-container"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="prof-user-menu">
                  <div className="prof-user-avatar-small">
                    {profileData?.profilePhoto ? (
                      <img 
                        src={profileData.profilePhoto} 
                        alt="Profile" 
                        className="prof-avatar-img"
                      />
                    ) : (
                      <img src="https://i.pravatar.cc/40?u=david" alt="User" />
                    )}
                  </div>
                  <div className="prof-user-info">
                    <span className="prof-user-name">{displayName}</span>
                    <span className="prof-user-role">{isJobSeeker ? 'Job Seeker' : 'Employer'}</span>
                  </div>
                  <ChevronDown size={16} className="prof-dropdown-arrow" />
                </div>
              </div>
              {showProfileMenu && (
                <div className="prof-user-dropdown">
                  <button 
                    className="prof-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveView('profile');
                      setIsEditingProfile(false);
                    }}
                  >
                    <UserCircle size={18} />
                    View Profile
                  </button>
                  <button 
                    className="prof-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveView('profile');
                      setIsEditingProfile(true);
                    }}
                  >
                    <Settings size={18} />
                    Edit Profile
                  </button>
                  <button 
                    className="prof-dropdown-item"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setActiveView('profile');
                      setIsEditingProfile(false);
                      setTimeout(() => {
                        setTriggerPhotoUpload(true);
                        setTimeout(() => setTriggerPhotoUpload(false), 100);
                      }, 300);
                    }}
                  >
                    <User size={18} />
                    Upload Profile Photo
                  </button>
                  {isJobSeeker && (
                    <button 
                      className="prof-dropdown-item"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveView('resume');
                      }}
                    >
                      <FileText size={18} />
                      Resume Management
                    </button>
                  )}
                  <div className="prof-dropdown-divider"></div>
                  <button 
                    className="prof-dropdown-item prof-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="prof-content">
          {activeView === 'profile' ? (
            <div className="prof-content-full">
              {!isEditingProfile ? (
                <>
                  {/* Profile View */}
                  <div className="prof-profile-view">
                    <div className="prof-profile-header-view">
                      <div className="prof-profile-header-avatar-section">
                        <div className="prof-profile-header-avatar-large">
                          {profileData?.profilePhoto ? (
                            <img 
                              src={profileData.profilePhoto} 
                              alt="Profile" 
                              className="prof-avatar-large-img"
                            />
                          ) : (
                            <div className="prof-avatar-placeholder">
                              {displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="prof-profile-photo-actions">
                          <ProfilePhotoUpload
                            userId={user?.uid}
                            userType={user?.userType}
                            currentPhotoUrl={profileData?.profilePhoto}
                            triggerUpload={triggerPhotoUpload}
                            onPhotoUpdate={(newPhoto) => {
                              // Update local state immediately for preview
                              setProfileData({ ...profileData, profilePhoto: newPhoto });
                            }}
                          />
                        </div>
                      </div>
                      <div className="prof-profile-header-info-view">
                        <h2>{displayName || 'User'}</h2>
                        <p className="prof-profile-subtitle-view">
                          {isJobSeeker 
                            ? (profileData?.headline || 'Job Seeker') 
                            : (profileData?.industry || 'Employer')}
                        </p>
                        {isJobSeeker && profileData?.currentCity && (
                          <p className="prof-profile-location-view">
                            📍 {profileData.currentCity}{profileData.state ? `, ${profileData.state}` : ''}
                          </p>
                        )}
                        {!isJobSeeker && profileData?.city && (
                          <p className="prof-profile-location-view">
                            📍 {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}
                          </p>
                        )}
                      </div>
                      <div className="prof-profile-header-actions-view">
                        <button 
                          className="prof-edit-profile-btn"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          ✏️ Edit Profile
                        </button>
                        <button 
                          className="prof-back-dashboard-btn"
                          onClick={() => setActiveView('dashboard')}
                        >
                          ← Back to Dashboard
                        </button>
                      </div>
                    </div>

                    {/* Profile Information Display */}
                    {isJobSeeker ? (
                      <div className="prof-profile-info-cards">
                        <div className="prof-info-card">
                          <h3>📋 Personal Information</h3>
                          <div className="prof-info-item">
                            <label>Full Name</label>
                            <div>{profileData?.firstName && profileData?.lastName 
                              ? `${profileData.firstName} ${profileData.lastName}` 
                              : 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Email</label>
                            <div>{profileData?.email || user?.email || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Phone</label>
                            <div>{profileData?.phoneNumber || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Location</label>
                            <div>{profileData?.currentCity 
                              ? `${profileData.currentCity}${profileData.state ? `, ${profileData.state}` : ''}`
                              : 'Not provided'}</div>
                          </div>
                        </div>

                        <div className="prof-info-card">
                          <h3>💼 Professional Information</h3>
                          <div className="prof-info-item">
                            <label>Headline</label>
                            <div>{profileData?.headline || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Summary</label>
                            <div>{profileData?.professionalSummary || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Experience</label>
                            <div>{profileData?.experience !== undefined ? `${profileData.experience} years` : 'Not specified'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Skills</label>
                            <div>
                              {profileData?.skills && profileData.skills.length > 0 ? (
                                <div className="prof-skills-list">
                                  {profileData.skills.map((skill, index) => (
                                    <span key={index} className="prof-skill-tag">{skill}</span>
                                  ))}
                                </div>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prof-profile-info-cards">
                        <div className="prof-info-card">
                          <h3>🏢 Company Information</h3>
                          <div className="prof-info-item">
                            <label>Company Name</label>
                            <div>{profileData?.companyName || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Industry</label>
                            <div>{profileData?.industry || 'Not specified'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Company Size</label>
                            <div>{profileData?.companySize || 'Not specified'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Website</label>
                            <div>
                              {profileData?.website ? (
                                <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                                  {profileData.website}
                                </a>
                              ) : (
                                'Not provided'
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="prof-info-card">
                          <h3>📍 Contact Information</h3>
                          <div className="prof-info-item">
                            <label>Email</label>
                            <div>{profileData?.email || user?.email || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Phone</label>
                            <div>{profileData?.phoneNumber || 'Not provided'}</div>
                          </div>
                          <div className="prof-info-item">
                            <label>Address</label>
                            <div>{profileData?.officeAddress 
                              ? `${profileData.officeAddress}, ${profileData.city || ''}`
                              : 'Not provided'}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Profile Edit Mode */}
                  <div className="prof-profile-edit-header">
                    <h2>✏️ Edit Your Profile</h2>
                    <div className="prof-profile-edit-actions">
                      <button 
                        className="prof-btn-back"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        ← Back to View
                      </button>
                      <button 
                        className="prof-btn-cancel"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setActiveView('dashboard');
                        }}
                      >
                        Cancel & Close
                      </button>
                    </div>
                  </div>
                  {isJobSeeker ? (
                    <JobSeekerProfileForm userId={user?.uid} onSave={handleProfileSave} />
                  ) : (
                    <EmployerProfileForm userId={user?.uid} onSave={handleProfileSave} />
                  )}
                </>
              )}
            </div>
          ) : activeView === 'resume' && isJobSeeker ? (
            <div className="prof-content-full">
              <div className="prof-resume-header">
                <h2>Resume Management</h2>
                <button 
                  className="prof-back-dashboard-btn"
                  onClick={() => setActiveView('dashboard')}
                >
                  ← Back to Dashboard
                </button>
              </div>
              <ResumeUpload userId={user?.uid} />
            </div>
          ) : activeView === 'jobs' ? (
            <div className="prof-content-full">
              <JobList userId={user?.uid} userType={user?.userType} />
            </div>
          ) : activeView === 'applications' ? (
            <div className="prof-content-full">
              <JobApplications userId={user?.uid} userType={user?.userType} />
            </div>
          ) : activeView === 'postJob' ? (
            <div className="prof-content-full">
              <JobPost 
                userId={user?.uid} 
                onSuccess={handleJobPostSuccess}
                onCancel={() => setActiveView('dashboard')}
              />
            </div>
          ) : (
            <>
              <div className="prof-content-main">
                {/* Stats Cards */}
            <div className="prof-stats-grid">
              <div className="prof-stat-card">
                <div className="prof-stat-icon green">
                  <Briefcase size={24} />
                </div>
                <div className="prof-stat-content">
                  <h3>43</h3>
                  <p>Application Sent</p>
                </div>
                <div className="prof-stat-progress">
                  <div className="prof-progress-bar" style={{width: '70%', backgroundColor: '#00B894'}}></div>
                </div>
              </div>
              
              <div className="prof-stat-card">
                <div className="prof-stat-icon blue">
                  <Calendar size={24} />
                </div>
                <div className="prof-stat-content">
                  <h3>27</h3>
                  <p>Interviews Schedule</p>
                </div>
                <div className="prof-stat-progress">
                  <div className="prof-progress-bar" style={{width: '60%', backgroundColor: '#0984E3'}}></div>
                </div>
              </div>
              
              <div className="prof-stat-card">
                <div className="prof-stat-icon orange">
                  <Users size={24} />
                </div>
                <div className="prof-stat-content">
                  <h3>52k</h3>
                  <p>Profile Viewed</p>
                </div>
                <div className="prof-stat-progress">
                  <div className="prof-progress-bar" style={{width: '85%', backgroundColor: '#FDCB6E'}}></div>
                </div>
              </div>
            </div>

            {/* Vacancy Stats Chart */}
            <div className="prof-card">
              <div className="prof-card-header">
                <div>
                  <h3>Vacancy Stats</h3>
                  <div className="prof-chart-filters">
                    <button className="prof-filter-btn active">
                      <span className="prof-filter-dot green"></span>
                      Application Sent <span className="prof-filter-count">{chartData.reduce((sum, d) => sum + (d.applicationSent || 0), 0)}</span>
                    </button>
                    <button className="prof-filter-btn">
                      <span className="prof-filter-dot blue"></span>
                      Interviews <span className="prof-filter-count">{chartData.reduce((sum, d) => sum + (d.interviews || 0), 0)}</span>
                    </button>
                    <button className="prof-filter-btn">
                      <span className="prof-filter-dot red"></span>
                      Rejected <span className="prof-filter-count">{chartData.reduce((sum, d) => sum + (d.rejected || 0), 0)}</span>
                    </button>
                  </div>
                </div>
                <button className="prof-dropdown-btn">
                  This Month <ChevronDown size={16} />
                </button>
              </div>
              <div className="prof-chart-container">
                {statsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                    <div className="spinner"></div>
                    <p style={{ marginLeft: '10px' }}>Loading stats...</p>
                  </div>
                ) : chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="applicationSent" 
                        stroke="#00B894" 
                        strokeWidth={3}
                        dot={{ fill: '#00B894', r: 5 }}
                        name={isJobSeeker ? "Application Sent" : "Received Applications"}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interviews" 
                        stroke="#0984E3" 
                        strokeWidth={3}
                        dot={{ fill: '#0984E3', r: 5 }}
                        name="Interviews"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rejected" 
                        stroke="#D63031" 
                        strokeWidth={3}
                        dot={{ fill: '#D63031', r: 5 }}
                        name="Rejected"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#999' }}>
                    <p>No data available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="prof-card">
              <div className="prof-card-header">
                <h3>Recommended Jobs</h3>
                <button className="prof-link-btn" onClick={() => setActiveView('jobs')}>View More</button>
              </div>
              <div className="prof-jobs-grid">
                {jobsLoading ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                    <div className="spinner"></div>
                    <p>Loading jobs...</p>
                  </div>
                ) : jobsError ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#d63031' }}>
                    <p>{jobsError}</p>
                  </div>
                ) : recommendedJobs.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                    <p>No jobs available yet</p>
                  </div>
                ) : (
                  recommendedJobs.map((job, index) => {
                    const colors = ['#FFD93D', '#FF6B6B', '#6C5CE7', '#00D9FF'];
                    const bgColor = colors[index % colors.length];
                    return (
                      <div key={job._id || job.id} className="prof-job-card">
                        <div className="prof-job-header">
                          <div className="prof-job-logo" style={{backgroundColor: bgColor}}>
                            {job.company?.charAt(0) || 'J'}
                          </div>
                          <button className="prof-follow-btn">+Follow</button>
                        </div>
                        <h4>{job.title}</h4>
                        <p className="prof-job-company">{job.company}</p>
                        <div className="prof-job-details">
                          <div className="prof-job-detail">
                            <DollarSign size={16} />
                            <span>{job.salary ? (job.salary.replace('?', '').includes('₹') ? job.salary.replace('?', '') : `₹${job.salary.replace('?', '')}`) : '₹Competitive'}</span>
                          </div>
                          <div className="prof-job-detail">
                            <MapPin size={16} />
                            <span>{job.location || `${job.city || 'Remote'}${job.state ? ', ' + job.state : ''}`}</span>
                          </div>
                        </div>
                        <div className="prof-job-footer">
                          <span className="prof-job-type">{job.jobType?.toUpperCase() || 'FULL-TIME'}{job.workMode ? `, ${job.workMode.toUpperCase()}` : ''}</span>
                          <button className="prof-map-btn" onClick={() => setSelectedRecommendedJob(job)}><Eye size={16} />View Details</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Featured Companies */}
            <div className="prof-card">
              <div className="prof-card-header">
                <h3>Featured Companies</h3>
                <button className="prof-link-btn">View More</button>
              </div>
              <div className="prof-companies">
                <div className="prof-company-logo" style={{backgroundColor: '#FFD93D'}}>M</div>
                <div className="prof-company-logo" style={{backgroundColor: '#FF6B6B'}}>G</div>
                <div className="prof-company-logo" style={{backgroundColor: '#6C5CE7'}}>I</div>
                <div className="prof-company-logo" style={{backgroundColor: '#00D9FF'}}>T</div>
                <div className="prof-company-logo" style={{backgroundColor: '#00B894'}}>A</div>
              </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="prof-right-sidebar">
            {/* User Profile */}
            <div className="prof-card prof-profile-card">
              <div className="prof-profile-avatar">
                {profileData?.profilePhoto ? (
                  <img src={profileData.profilePhoto} alt={displayName} />
                ) : (
                  <img src="https://i.pravatar.cc/100?u=user" alt={displayName} />
                )}
                <div className="prof-profile-ring"></div>
              </div>
              <h3>{displayName}</h3>
              <p>{isJobSeeker 
                ? (profileData?.headline || 'Job Seeker') 
                : (profileData?.industry || 'Employer')}</p>
              {isJobSeeker && profileData?.skills && profileData.skills.length > 0 && (
                <div className="prof-skills">
                  {profileData.skills.slice(0, 3).map((skill, index) => {
                    const colors = ['orange', 'green', 'blue', 'purple'];
                    return (
                      <span key={index} className={`prof-skill ${colors[index % colors.length]}`}>
                        {skill}
                      </span>
                    );
                  })}
                </div>
              )}
              {!isJobSeeker && (
                <div className="prof-skills">
                  <span className="prof-skill blue">{profileData?.companySize || 'Company'}</span>
                  <span className="prof-skill green">{profileData?.city || 'Location'}</span>
                </div>
              )}
              {selectedRecommendedJob && (
                <JobDetailsModal
                  job={selectedRecommendedJob}
                  onClose={() => setSelectedRecommendedJob(null)}
                  onUpdated={() => { fetchRecommendedJobs(); if (user?.userType === 'employer') fetchEmployerJobs(user.uid); }}
                  currentUserId={user?.uid}
                  currentUserType={user?.userType}
                />
              )}
            </div>

            {/* Recent Activities */}
            <div className="prof-card">
              <h3>Recent Activities</h3>
              <div className="prof-activities">
                <div className="prof-activity">
                  <div className="prof-activity-icon purple">
                    <Briefcase size={16} />
                  </div>
                  <div className="prof-activity-content">
                    <p>Your application has been accepted in 3 Vacancy</p>
                    <span>12h ago</span>
                  </div>
                </div>
                <div className="prof-activity">
                  <div className="prof-activity-icon purple">
                    <Briefcase size={16} />
                  </div>
                  <div className="prof-activity-content">
                    <p>Your application has been accepted in 3 Vacancy</p>
                    <span>12h ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="prof-floating-btns">
              <button className="prof-float-btn blue" title="Pounce">
                <TrendingUp size={20} />
              </button>
            </div>
            </aside>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfessionalDashboard;
