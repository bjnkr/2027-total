import React from 'react';

interface CarWarningModalProps {
    onClose: () => void;
}

const CarWarningModal: React.FC<CarWarningModalProps> = ({ onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content car-warning-modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
                <div className="result-section" style={{ textAlign: 'center' }}>
                    <div className="warning-icon" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px', fontWeight: 'bold' }}>!</div>
                    <h3 className="warning-title" style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#1e293b' }}>자동차 기준 확인</h3>
                    <p className="warning-message" style={{ marginBottom: '16px', lineHeight: '1.5', color: '#475569' }}>
                        해당 자동차는 <strong className="highlight-red" style={{ color: '#ef4444' }}>100% 환산율 적용 자동차</strong> 입니다.<br />
                        복지 혜택을 받기 어렵습니다.
                    </p>
                    <p className="contact-info" style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
                        자세한 내용은 복지센터에 문의 바랍니다.
                    </p>
                    <div className="car-modal-buttons single-button">
                        <button type="button" onClick={onClose} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>다시 확인하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarWarningModal;
