
import React from 'react';

export const OnboardingWelcomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradWelcome" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="100%" stopColor="#27AE60" />
        </linearGradient>
      </defs>
      <path d="M50,150 C50,100 150,100 150,150 Z" fill="url(#gradWelcome)" />
      <circle cx="100" cy="80" r="30" fill="url(#gradWelcome)"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke="#E0E0E0" strokeWidth="4" strokeDasharray="10 5"/>
    </svg>
);
