
import type { UnifiedFormState } from '../types';
import { parseFormattedNumber } from '../utils';

interface Props {
    formData: UnifiedFormState;
    onClose: () => void;
}

export default function InterestIncomeDetailsModal({ formData, onClose }: Props) {
    const getMultiplier = (unit: string) => unit === 'manwon' ? 10000 : 1;
    const formatCurrency = (val: number) => Math.round(val).toLocaleString();

    const rawVal = parseFloat(parseFormattedNumber(formData.propertyInterestIncome || '0'));
    const unit = formData.inputUnits?.propertyInterestIncome || 'manwon';
    const totalIncome = rawVal * getMultiplier(unit);
    
    const months = parseInt(parseFormattedNumber(formData.propertyInterestMonths || '12'), 10) || 12;
    
    // 이자소득 공제: 가입기간 1년(12개월) 이하일 경우 기본 24만원 공제, 초과시 (2만원 * 가입기간) 공제
    const interestDeduction = months <= 12 ? 240000 : 20000 * months;
    
    // 월 반영 소득액: (총 이자소득 - 공제액) / 12개월
    const evaluatedIncome = Math.floor(Math.max(0, (totalIncome - interestDeduction) / 12));

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                backgroundColor: '#ffffff', borderRadius: '12px', width: '100%',
                maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', padding: '30px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'none',
                    border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b'
                }}>×</button>
                
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.4rem', color: '#0050a0', fontWeight: 'bold' }}>이자소득 상세 계산내역</h2>
                <div className="modal-body">
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                        이자소득은 연 24만원(월 2만원)을 기본 공제한 후 남은 금액을 12개월로 나누어 월 소득으로 반영합니다.
                    </p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#475569', fontWeight: '500' }}>총 이자소득</span>
                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{formatCurrency(totalIncome)} 원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#475569', fontWeight: '500' }}>가입기간</span>
                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{months} 개월</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span style={{ color: '#ef4444', fontWeight: '500' }}>기본 공제액</span>
                            <span style={{ fontWeight: 'bold', color: '#ef4444' }}>(-) {formatCurrency(interestDeduction)} 원</span>
                        </div>
                        
                        <div style={{ height: '1px', backgroundColor: '#cbd5e1', margin: '16px 0' }}></div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#0f4c81', fontWeight: 'bold' }}>월 반영 소득액</span>
                            <span style={{ fontWeight: 'bold', color: '#0f4c81', fontSize: '1.1rem' }}>{formatCurrency(evaluatedIncome)} 원</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                            ({formatCurrency(Math.max(0, totalIncome - interestDeduction))}원 ÷ 12개월)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
