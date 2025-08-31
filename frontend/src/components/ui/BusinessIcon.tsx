import React from 'react';

interface BusinessIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'business' | 'freelancer';
}

const BusinessIcon: React.FC<BusinessIconProps> = ({ 
  className = '',
  size = 'md',
  type = 'business'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const baseClasses = `${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-sm ${className}`;

  if (type === 'freelancer') {
    // Individual person icon for freelancers
    return (
      <div className={baseClasses}>
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 7.5C13.1 8.4 12.2 9 11.2 9H8.8C7.8 9 6.9 8.4 6.5 7.5L5 4L-1 7V9H8V22H16V9H21Z"/>
        </svg>
      </div>
    );
  }

  // Default business/company icon
  return (
    <div className={baseClasses}>
      <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z"/>
      </svg>
    </div>
  );
};

export default BusinessIcon;