import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  size = 'medium', 
  className = '', 
  color = 'blue-700', 
  thickness = '2', 
  speed = 'normal' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const speedClasses = {
    slow: 'animate-[spin_1.5s_linear_infinite]',
    normal: 'animate-[spin_1s_linear_infinite]',
    fast: 'animate-[spin_0.5s_linear_infinite]'
  };

  return (
    <div 
      className={`inline-block rounded-full border-b-${thickness} border-${color} ${sizeClasses[size]} ${speedClasses[speed]} ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  className: PropTypes.string,
  color: PropTypes.string,
  thickness: PropTypes.string,
  speed: PropTypes.oneOf(['slow', 'normal', 'fast'])
};

export default LoadingSpinner;