import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading data...' }) => {
  return (
    <div className="spinner-container" role="status">
      <div className="spinner" />
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{message}</span>
    </div>
  );
};
