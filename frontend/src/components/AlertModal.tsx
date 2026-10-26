import React from 'react';

interface AlertModalProps {
    title?: string;
    message: string;
    onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ title = "입력 확인", message, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal-content car-warning-modal" onClick={e => e.stopPropagation()}>
                <div className="result-section">
                    <div className="warning-icon">!</div>
                    <h3 className="warning-title">{title}</h3>
                    <p className="warning-message">
                        {message}
                    </p>
                    <div className="car-modal-buttons single-button">
                        <button type="button" onClick={onClose}>확인</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
