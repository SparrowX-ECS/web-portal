import React from 'react';
import { AlertIcon, RefreshIcon } from './Icons';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  status?: number;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, status, onRetry }) => {
  return (
    <div className="alert alert-danger" role="alert">
      <AlertIcon style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontWeight: 600 }}>Error:</strong>
          <span>{message}</span>
          {status && (
            <span
              style={{
                fontSize: 11,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                fontWeight: 600,
              }}
            >
              HTTP {status}
            </span>
          )}
        </div>
        {onRetry && (
          <div>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshIcon size={12} />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
