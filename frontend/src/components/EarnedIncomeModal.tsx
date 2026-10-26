import { useState, useEffect } from 'react';
import { AlertModal } from './AlertModal';

interface Props {
    isOpen: boolean;
    householdSize: number;
    onClose: () => void;
    onSubmit: (members: { ageGroup: string }[]) => void;
}

export default function EarnedIncomeModal({ isOpen, householdSize, onClose, onSubmit }: Props) {
    const [memberCount, setMemberCount] = useState<number>(0);
    const [ages, setAges] = useState<string[]>([]);
    const [step, setStep] = useState<number>(1);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // 모달이 열릴 때 기본값을 1명으로 설정
    useEffect(() => {
        if (isOpen) {
            setMemberCount(1);
            setStep(1);
        }
    }, [isOpen, householdSize]);

    if (!isOpen) return null;

    const handleCountSubmit = () => {
        if (memberCount < 0) return;
        if (memberCount === 0) {
            onSubmit([]);
            return;
        }
        setAges(Array(memberCount).fill(''));
        setStep(2);
    };

    const handleAgeSubmit = () => {
        if (ages.some(age => age === '')) {
            setAlertMessage('가구원의 나이를 선택해 주세요');
            return;
        }
        onSubmit(ages.map(age => ({ ageGroup: age })));
    };

    const handleAgeChange = (index: number, value: string) => {
        const newAges = [...ages];
        newAges[index] = value;
        setAges(newAges);
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '24px', borderRadius: '8px',
                width: '400px', maxWidth: '90vw', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                {step === 1 ? (
                    <>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>근로소득(사업소득)이 있는 가구원 확인</h3>
                        <div className="form-group">
                            <label style={{ display: 'block', marginBottom: '12px', color: '#475569' }}>
                                근로소득 (사업소득)이 있는 가구원은 몇 명인가요?
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {Array.from({ length: householdSize + 1 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setMemberCount(i)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: memberCount === i ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                            backgroundColor: memberCount === i ? '#eff6ff' : 'white',
                                            color: memberCount === i ? '#1d4ed8' : '#475569',
                                            cursor: 'pointer',
                                            fontWeight: memberCount === i ? 600 : 400,
                                            flex: '1 0 calc(33% - 8px)',
                                            minWidth: '60px'
                                        }}
                                    >
                                        {i === 0 ? '없음' : `${i}명`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                            <button type="button" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>취소</button>
                            <button type="button" onClick={handleCountSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>다음</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>근로소득(사업소득)이 있는 가구원 나이 선택</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                            {ages.map((age, index) => (
                                <div key={index} className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: 500 }}>
                                        가구원 {index + 1} 나이 선택
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {[
                                            { value: '34_or_less', label: '34세 이하' },
                                            { value: '35_to_64', label: '35세 - 64세' },
                                            { value: '65_or_more', label: '65세 이상' }
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleAgeChange(index, option.value)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '6px',
                                                    border: age === option.value ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                                    backgroundColor: age === option.value ? '#eff6ff' : 'white',
                                                    color: age === option.value ? '#1d4ed8' : '#475569',
                                                    cursor: 'pointer',
                                                    fontWeight: age === option.value ? 600 : 400,
                                                    flex: '1 0 calc(33.333% - 6px)',
                                                    minWidth: '80px',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                            <button type="button" onClick={() => setStep(1)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: 'white', cursor: 'pointer' }}>이전</button>
                            <button type="button" onClick={handleAgeSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>완료</button>
                        </div>
                    </>
                )}
            </div>
            {alertMessage && (
                <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
        </div>
    );
}
