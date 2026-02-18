
import React from 'react';

export const WelcomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 80 Q50 40 80 80 Z" fill="currentColor" opacity="0.2"/>
      <path d="M30 80 Q50 60 70 80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="50" cy="45" r="15" fill="currentColor"/>
    </svg>
);
