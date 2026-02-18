import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { registerUser } from '../services/mongoAuthService';
import '../styles/Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState('jobseeker');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl === 'employer' || typeFromUrl === 'jobseeker') {
      setUserType(typeFromUrl);
    }
  }, [searchParams]);

  const validateForm = () => {
    if (!email || !displayName || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (displayName.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerUser(email, password, displayName, userType);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-wrapper">
          {/* Left Side - Features */}
          <div className="auth-features">
            <div className="features-header">
              <h2>Join CareerHub</h2>
              <p>Start your journey today</p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <div className="feature-text">
                  <h4>Quick Setup</h4>
                  <p>Get started in minutes</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div className="feature-text">
                  <h4>Smart Matching</h4>
                  <p>AI-powered job recommendations</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <div className="feature-text">
                  <h4>Global Opportunities</h4>
                  <p>Access thousands of job listings</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <div className="feature-text">
                  <h4>Grow Your Career</h4>
                  <p>Build your professional profile</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-wrapper">
            <div className="auth-card">
              <div className="auth-header">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join our community of professionals</p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="displayName">
                    <span className="label-icon">👤</span>
                    Full Name
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      autoComplete="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="John Doe"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="userType">
                    <span className="label-icon">💼</span>
                    I am a
                  </label>
                  <div className="user-type-selector">
                    <label className={`type-option ${userType === 'jobseeker' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="jobseeker"
                        checked={userType === 'jobseeker'}
                        onChange={(e) => setUserType(e.target.value)}
                      />
                      <span className="type-label">Job Seeker</span>
                    </label>
                    <label className={`type-option ${userType === 'employer' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="userType"
                        value="employer"
                        checked={userType === 'employer'}
                        onChange={(e) => setUserType(e.target.value)}
                      />
                      <span className="type-label">Employer</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <span className="label-icon">🔐</span>
                    Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <span className="label-icon">🔄</span>
                    Confirm Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="button-loader"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>Create Account</>
                  )}
                </button>
              </form>

              <div className="auth-divider">
                <span>Already have an account?</span>
              </div>

              <p className="auth-footer">
                <Link to="/login" className="auth-link-primary">
                  Sign In
                </Link>
              </p>

              <p className="auth-footer-secondary">
                By signing up, you agree to our{' '}
                <Link to="/" className="auth-link-text">
                  Terms & Privacy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
