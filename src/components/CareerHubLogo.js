import React from 'react';

/**
 * CareerHub Advanced Logo Component
 * Professional SVG logo with modern network hub design
 */
const CareerHubLogo = ({ size = 40, variant = 'icon' }) => {
  if (variant === 'full') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LogoIcon size={size} />
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            CareerHub
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>
            Career Platform
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'text-only') {
    return (
      <div>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
          CareerHub
        </h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>
          Your Gateway to Opportunities
        </p>
      </div>
    );
  }

  return <LogoIcon size={size} />;
};

/**
 * Logo Icon Component - Professional SVG Design
 * Features network hub with interconnected nodes representing careers and opportunities
 */
const LogoIcon = ({ size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Background */}
      <circle cx="50" cy="50" r="48" fill="#f0f9ff" />

      {/* Connection Lines - Network */}
      <line x1="50" y1="50" x2="30" y2="35" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />
      <line x1="50" y1="50" x2="70" y2="35" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />
      <line x1="50" y1="50" x2="30" y2="65" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />
      <line x1="50" y1="50" x2="70" y2="65" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />
      <line x1="50" y1="50" x2="50" y2="25" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />
      <line x1="50" y1="50" x2="50" y2="75" stroke="#60a5fa" strokeWidth="2" opacity="0.7" />

      {/* Central Hub Circle - Larger */}
      <circle cx="50" cy="50" r="12" fill="url(#hubGradient)" />

      {/* Central Hub Inner Highlight */}
      <circle cx="50" cy="50" r="9" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />

      {/* Career Nodes - Top */}
      <circle cx="50" cy="25" r="7" fill="url(#nodeGradient)" />
      <circle cx="50" cy="25" r="5" fill="#ffffff" opacity="0.3" />

      {/* Career Nodes - Left Top */}
      <circle cx="30" cy="35" r="6" fill="url(#nodeGradient)" />
      <circle cx="30" cy="35" r="4" fill="#ffffff" opacity="0.3" />

      {/* Career Nodes - Right Top */}
      <circle cx="70" cy="35" r="6" fill="url(#nodeGradient)" />
      <circle cx="70" cy="35" r="4" fill="#ffffff" opacity="0.3" />

      {/* Career Nodes - Left Bottom */}
      <circle cx="30" cy="65" r="6" fill="url(#nodeGradient)" />
      <circle cx="30" cy="65" r="4" fill="#ffffff" opacity="0.3" />

      {/* Career Nodes - Right Bottom */}
      <circle cx="70" cy="65" r="6" fill="url(#nodeGradient)" />
      <circle cx="70" cy="65" r="4" fill="#ffffff" opacity="0.3" />

      {/* Career Nodes - Bottom */}
      <circle cx="50" cy="75" r="7" fill="url(#nodeGradient)" />
      <circle cx="50" cy="75" r="5" fill="#ffffff" opacity="0.3" />

      {/* Decorative Corner Accents */}
      <path
        d="M 85 50 Q 88 40 85 30"
        stroke="#dbeafe"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 15 50 Q 12 60 15 70"
        stroke="#dbeafe"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CareerHubLogo;
export { LogoIcon };
