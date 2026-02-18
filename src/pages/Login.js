import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/mongoAuthService';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
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
              <h2>Welcome to CareerHub</h2>
              <p>Your gateway to success</p>
            </div>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <div className="feature-text">
                  <h4>Easy to Use</h4>
                  <p>Intuitive interface designed for everyone</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <div className="feature-text">
                  <h4>Secure & Safe</h4>
                  <p>Your data is encrypted and protected</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <div className="feature-text">
                  <h4>Fast Matching</h4>
                  <p>Find perfect opportunities in seconds</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <div className="feature-text">
                  <h4>24/7 Support</h4>
                  <p>Always here to help you succeed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="auth-form-wrapper">
            <div className="auth-card">
              <div className="auth-header">
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
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
                  <label htmlFor="password">
                    <span className="label-icon">🔐</span>
                    Password
                  </label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="current-password"
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
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>

                <button type="submit" className="auth-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="button-loader"></span>
                      Logging in...
                    </>
                  ) : (
                    <>Sign In</>
                  )}
                </button>
              </form>

              <div className="auth-divider">
                <span>Don't have an account?</span>
              </div>

              <p className="auth-footer">
                <Link to="/register" className="auth-link-primary">
                  Create Account
                </Link>
              </p>

              <p className="auth-footer-secondary">
                Not sure?{' '}
                <Link to="/" className="auth-link-text">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
