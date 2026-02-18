
import React from 'react';

export const OnboardingListsIcon: React.FC<{className?: string}> = ({ className }) => (
   <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="100%" stopColor="#27AE60" />
        </linearGradient>
      </defs>
      <rect x="25" y="50" width="150" height="120" rx="15" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="4"/>
      <path d="M 50 80 L 70 80" stroke="url(#grad1)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 90 80 L 150 80" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 50 110 L 70 110" stroke="url(#grad1)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 90 110 L 150 110" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 50 140 L 70 110" stroke="url(#grad1)" strokeWidth="0" strokeLinecap="round"/>
      <path d="M 90 140 L 150 140" stroke="#E0E0E0" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="60" cy="140" r="10" fill="#2ECC71"/>
      <path d="M 55 140 L 60 145 L 70 135" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
