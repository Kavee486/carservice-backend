import React from 'react';

const Logo = ({ className = '', variant = 'default' }) => {
  if (variant === 'modern') {
    return (
      <svg 
        className={className}
        viewBox="0 0 200 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M10 30L20 10L40 10L50 30H10Z" 
          fill="#3B82F6" 
          stroke="#1E40AF" 
          strokeWidth="2"
        />
        <circle 
          cx="20" 
          cy="30" 
          r="8" 
          fill="#111827" 
          stroke="#1E40AF" 
          strokeWidth="2"
        />
        <circle 
          cx="40" 
          cy="30" 
          r="8" 
          fill="#111827" 
          stroke="#1E40AF" 
          strokeWidth="2"
        />
        <path 
          d="M25 15L35 15" 
          stroke="#F97316" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <text 
          x="65" 
          y="35" 
          fontFamily="'Inter', sans-serif" 
          fontSize="24" 
          fontWeight="800" 
          fill="#111827"
          letterSpacing="1.5"
        >
          AUTODECK
        </text>
      </svg>
    );
  }

  return (
    <svg 
      className={className}
      viewBox="0 0 200 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20 10L30 40H10L20 10Z" 
        fill="#3B82F6" 
        stroke="#1E40AF" 
        strokeWidth="2"
      />
      <path 
        d="M30 40L40 10L50 40H30Z" 
        fill="#3B82F6" 
        stroke="#1E40AF" 
        strokeWidth="2"
      />
      <circle 
        cx="35" 
        cy="25" 
        r="5" 
        fill="#F97316" 
        stroke="#C2410C" 
        strokeWidth="2"
      />
      <text 
        x="65" 
        y="35" 
        fontFamily="Arial, sans-serif" 
        fontSize="24" 
        fontWeight="bold" 
        fill="#111827"
      >
        AutoDeck
      </text>
    </svg>
  );
};

export default Logo;