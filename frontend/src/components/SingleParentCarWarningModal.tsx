import React from 'react';

interface SingleParentCarWarningModalProps {
    onClose: () => void;
    onProceed: () => void;
}

const SingleParentCarWarningModal: React.FC<SingleParentCarWarningModalProps> = ({ onClose, onProceed }) => {
    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="modal-content car-warning-modal" onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
                <div className="result-section" style={{ textAlign: 'center' }}>
                    <div className="warning-icon" style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px', fontWeight: 'bold' }}>!</div>
                    <h3 className="warning-title" style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#1e293b' }}>자동차 기준 확인</h3>
                    <p className="warning-message" style={{ marginBottom: '16px', lineHeight: '1.5', color: '#475569', wordBreak: 'keep-all' }}>
                        해당 자동차를 보유하고 있는 경우 국민기초생활 보장, 차상위 지원은 <strong className="highlight-red" style={{ color: '#ef4444' }}>불가능</strong> 합니다.
                    </p>
                    <div className="car-check-tip" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontSize: '1rem', color: '#1e293b', fontWeight: 600, wordBreak: 'keep-all' }}>
                        "한부모 가족 지원" 한가지만 모의 계산을 하시겠습니까?
                    </div>
                    
                    <div className="car-modal-buttons" style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                            아니오
                        </button>
                        <button type="button" onClick={onProceed} style={{ flex: 1, padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                            네
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleParentCarWarningModal;
