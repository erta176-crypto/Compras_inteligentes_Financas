
import React from 'react';

export const OnboardingSyncIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradSync" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="100%" stopColor="#27AE60" />
        </linearGradient>
      </defs>
      <path d="M 60 40 C 60 20, 140 20, 140 40" fill="none" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 140 160 C 140 180, 60 180, 60 160" fill="none" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 120 40 L 140 40 L 140 60" fill="none" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 80 160 L 60 160 L 60 140" fill="none" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="100" cy="100" r="40" fill="url(#gradSync)"/>
      <path d="M 90 90 L 110 110 M 110 90 L 90 110" stroke="white" strokeWidth="6" fill="none" strokeLinecap="round"/>
    </svg>
);
