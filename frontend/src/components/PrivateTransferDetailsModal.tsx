import type { UnifiedFormState } from '../types';
import { MEDIAN_INCOME } from '../App';
import { parseFormattedNumber } from '../utils';

interface Props {
    formData: UnifiedFormState;
    onClose: () => void;
}

export default function PrivateTransferDetailsModal({ formData, onClose }: Props) {
    const householdSizeStr = formData.householdSize || '1';
    const householdSize = parseInt(householdSizeStr, 10) || 1;
    const medianIncome = MEDIAN_INCOME[householdSizeStr as keyof typeof MEDIAN_INCOME] || MEDIAN_INCOME['1'];
    const deduction15 = Math.floor(medianIncome * 0.15);
    const deduction50 = Math.floor(medianIncome * 0.5);

    const getMultiplier = (unit: string) => unit === 'manwon' ? 10000 : 1;
    const formatCurrency = (val: number) => Math.round(val).toLocaleString();

    const isSame = formData.privateTransferType === 'same';
    
    let totalDeductedSum = 0;
    let validCount = 0;
    const monthlyDetails = [];

    if (!isSame) {
        for (let i = 0; i < 12; i++) {
            const rawVal = parseFloat(parseFormattedNumber(formData.privateTransferTwelveMonths[i] || '0'));
            const unit = formData.privateTransferTwelveMonthUnits[i] || 'manwon';
            const inputVal = rawVal * getMultiplier(unit);
            
            if (inputVal > 0) validCount++;

            const deductedVal = Math.max(0, inputVal - deduction15);
            totalDeductedSum += deductedVal;
            
            monthlyDetails.push({
                month: i + 1,
                input: inputVal,
                deducted: deductedVal
            });
        }
    } else {
        const rawVal = parseFloat(parseFormattedNumber(formData.privateTransferIncome || '0'));
        const unit = formData.inputUnits?.privateTransferIncome || 'manwon';
        const inputVal = rawVal * getMultiplier(unit);
        
        const deductedVal = Math.max(0, inputVal - deduction15);
        totalDeductedSum = deductedVal; // Not really sum, just for display
        monthlyDetails.push({
            month: 1,
            input: inputVal,
            deducted: deductedVal
        });
    }

    const isFrequent = formData.isFrequentPrivateTransfer || validCount >= 6;
    let finalAmount = 0;
    if (isSame) {
        finalAmount = totalDeductedSum;
    } else {
        if (isFrequent) {
            finalAmount = totalDeductedSum / 12;
        } else {
            if (totalDeductedSum > deduction50) {
                finalAmount = (totalDeductedSum - deduction50) / 12;
            } else {
                finalAmount = 0;
            }
        }
    }

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001, display: 'flex',
            justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
            <div className="modal-content" style={{
                backgroundColor: '#ffffff', borderRadius: '12px', width: '100%',
                maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '30px',
                position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'none',
                    border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b'
                }}>×</button>
                
                <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', color: '#0050a0' }}>사적 이전소득 상세 계산 내역</h2>

                {isSame ? (
                    <>
                        <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', textAlign: 'center', borderTop: '2px solid #e2e8f0' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '15px', color: '#475569', fontWeight: 'bold' }}>구분</th>
                                        <th style={{ padding: '15px', color: '#475569', fontWeight: 'bold', textAlign: 'right' }}>금액</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '15px', color: '#334155' }}>월 지원금액</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#334155' }}>₩{formatCurrency(monthlyDetails[0].input)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '15px', color: '#334155' }}>기본공제 (기준 중위소득 15%)</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#ef4444' }}>- ₩{formatCurrency(deduction15)}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                                        <td style={{ padding: '15px', color: '#1e293b' }}>월 소득 평가액</td>
                                        <td style={{ padding: '15px', textAlign: 'right', color: '#1e293b' }}>₩{formatCurrency(monthlyDetails[0].deducted)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ backgroundColor: '#f0f8ff', padding: '24px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#0050a0', fontSize: '1.1rem' }}>적용된 계산 방식</h3>
                            <p style={{ margin: '0 0 20px 0', color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                매월 동일한 금액을 지원받는 경우, 월 지원금액에서 기준 중위소득의 15%를 공제하여 월 소득 평가액을 계산합니다.
                            </p>
                            <div style={{ borderLeft: '3px solid #0050a0', paddingLeft: '16px', fontSize: '1rem', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                                <p style={{ margin: '0 0 12px 0', color: '#334155' }}>
                                    월 소득 평가액 = 월 지원금액 <span style={{ color: '#16a34a', fontWeight: 'bold' }}>₩ {formatCurrency(monthlyDetails[0].input)}</span> - 공제액 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>₩ {formatCurrency(deduction15)}</span>
                                </p>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>
                                    = <span style={{ color: '#16a34a' }}>₩ {formatCurrency(monthlyDetails[0].deducted)}</span>
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.95rem' }}>
                            <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>
                                <strong>기준 중위소득 ({householdSize}인 가구):</strong> {formatCurrency(medianIncome)} 원<br/>
                                <span style={{ color: '#ef4444' }}>※ 사적이전소득 공제 (중위소득 15%): {formatCurrency(deduction15)} 원</span>
                            </p>
                        </div>

                        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'right' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                                        <th style={{ padding: '10px', textAlign: 'center' }}>월</th>
                                        <th style={{ padding: '10px' }}>입력 금액 (원)</th>
                                        <th style={{ padding: '10px' }}>15% 공제 적용 (원)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyDetails.map(m => (
                                        <tr key={m.month} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '10px', textAlign: 'center' }}>{m.month}개월</td>
                                            <td style={{ padding: '10px' }}>{formatCurrency(m.input)}</td>
                                            <td style={{ padding: '10px', color: m.deducted > 0 ? '#1e293b' : '#94a3b8' }}>
                                                {formatCurrency(m.deducted)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                        <td colSpan={2} style={{ padding: '12px', textAlign: 'center' }}>공제 후 1년 합계</td>
                                        <td style={{ padding: '12px', color: '#ef4444' }}>{formatCurrency(totalDeductedSum)} 원</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {!isFrequent && (
                            <div style={{ backgroundColor: '#fff7ed', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid #fdba74' }}>
                                <p style={{ margin: 0, color: '#9a3412', lineHeight: '1.6' }}>
                                    <strong>비정기적 지원금 기준 (중위소득 50%):</strong> {formatCurrency(deduction50)} 원<br/>
                                    ※ 1년 합계 금액이 {formatCurrency(deduction50)} 원을 초과하는 금액에 대해서만 소득으로 반영됩니다.
                                </p>
                            </div>
                        )}

                        <div className="calculation-details" style={{ marginTop: '20px' }}>
                            <div className="detail-item-title final" style={{ color: '#0f4c81' }}>최종 사적이전소득 평가액</div>
                            <div className="detail-item-value final" style={{ color: '#0f4c81' }}>{formatCurrency(finalAmount)} 원</div>
                            
                            <div className="calculation-formula-inline" style={{ gridColumn: '1 / -1', textAlign: 'right', fontSize: '0.85rem', color: '#64748b', marginTop: '5px' }}>
                                {isFrequent ? 
                                    `(정기적 지원금: 합계 ${formatCurrency(totalDeductedSum)}원 / 12)` : 
                                    (totalDeductedSum > deduction50 ? 
                                        `(비정기적 지원금 초과분: (${formatCurrency(totalDeductedSum)} - ${formatCurrency(deduction50)}) / 12)` : 
                                        `(비정기적 지원금 기준 미달로 전액 공제)`)
                                }
                            </div>
                        </div>
                    </>
                )}

                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button className="edit-btn" onClick={onClose} style={{ padding: '10px 40px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>닫기</button>
                </div>
            </div>
        </div>
    );
}
