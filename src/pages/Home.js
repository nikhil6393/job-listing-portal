import React from 'react';
import { Link } from 'react-router-dom';
import CareerHubLogo from '../components/CareerHubLogo';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CareerHubLogo size={40} variant="full" />
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/register" className="nav-btn register-btn">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Find Your Dream Job</h1>
          <p className="hero-subtitle">
            Connect with top employers and start your career journey today
          </p>
          <div className="cta-buttons">
            <Link to="/register?type=jobseeker" className="cta-btn primary-btn">
              I'm a Job Seeker
            </Link>
            <Link to="/register?type=employer" className="cta-btn secondary-btn">
              I'm an Employer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <h2>Why Choose Us</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>AI-powered job matching based on your skills and preferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Easy</h3>
              <p>Quick application process to save your time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Your data is protected with enterprise-level security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 CareerHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
