import React from 'react';

export const Tooltip: React.FC<{ content: React.ReactNode; tooltipClass?: string }> = ({ content, tooltipClass = '' }) => (
    <div className="tooltip-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <path d="M12 17h.01"></path>
        </svg>
        <span className={`tooltip-text ${tooltipClass}`}>{content}</span>
    </div>
);
