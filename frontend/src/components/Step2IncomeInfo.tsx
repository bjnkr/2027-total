import HelpButton from './HelpButton';
import React, { useState } from 'react';
import type { UnifiedFormState } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';
import InterestIncomeInputModal from './InterestIncomeInputModal';
import PrivateTransferInputModal from './PrivateTransferInputModal';
import CalculationIcon from './CalculationIcon';

interface Props {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (msg: string) => void;
    openHelpPanel?: (topic: string) => void;
}

export default function Step2IncomeInfo({ formData, setFormData, openHelpPanel }: Props) {
    const [showInterestInput, setShowInterestInput] = useState(false);
    const [showPrivateTransferInput, setShowPrivateTransferInput] = useState(false);
    const receivedMonths = formData.privateTransferTwelveMonths.filter(value => Number(value) > 0).length;
    const monthlySupportTotal = formData.privateTransferTwelveMonths.reduce((sum, value, i) => sum + Number(value || '0') * (formData.privateTransferTwelveMonthUnits[i] === 'won' ? 1 : 10000), 0);
    const hasMonthlySupportInput = formData.privateTransferTwelveMonths.some(value => value !== '') || formData.isFrequentPrivateTransfer;
    const handleEarnedIncomeChange = (id: number, field: 'amount' | 'type' | 'pension', value: string) => {
        const processedValue = (field === 'amount' || field === 'pension') ? parseFormattedNumber(value) : value;
        setFormData(prev => ({
            ...prev,
            earnedIncomes: prev.earnedIncomes.map(income => 
                income.id === id ? { ...income, [field]: processedValue } : income
            )
        }));
    };
    
    const handleEarnedIncomeUnitChange = (id: number, field: 'amountUnit' | 'pensionUnit') => {
        setFormData(prev => ({
            ...prev,
            earnedIncomes: prev.earnedIncomes.map(income => {
                if (income.id === id) {
                    return { ...income, [field]: income[field] === 'manwon' ? 'won' : 'manwon' };
                }
                return income;
            })
        }));
    };

    const handleUnitChange = (field: keyof UnifiedFormState['inputUnits']) => {
        setFormData(prev => ({
            ...prev,
            inputUnits: {
                ...prev.inputUnits,
                [field]: prev.inputUnits[field] === 'manwon' ? 'won' : 'manwon'
            }
        }));
    };

    const getAgeLabel = (ageGroup?: string) => {
        if (ageGroup === '34_or_less') return '34세 이하';
        if (ageGroup === '35_to_64') return '35세 - 64세';
        if (ageGroup === '65_or_more') return '65세 이상';
        return '';
    };

    const renderOptions = (ageGroup?: string) => {
        if (ageGroup === '34_or_less') {
            return (
                <option value="youth">34세 이하 청년 ( 60만원 + 추가공제 30% )</option>
            );
        }
        if (ageGroup === '65_or_more') {
            return (
                <>
                    <option value="senior">65세 이상 ( 20만원 + 추가공제 30% )</option>
                    <option value="student">대학생 ( 60만원 + 추가공제 30% )</option>
                </>
            );
        }
        if (ageGroup === '35_to_64') {
            return (
                <>
                    <option value="general">일반 30% 공제</option>
                    <option value="student">대학생 ( 60만원 + 추가공제 30% )</option>
                    <option value="student_over_35">35세이상 초,중,고등학생 ( 20만원 + 추가공제 30% )</option>
                    <option value="disabled">등록장애인 ( 20만원 + 추가공제 30% )</option>
                    <option value="disabled_rehab">등록장애인 (직업재활사업 참여 소득) ( 20만원 + 추가공제 50% )</option>
                </>
            );
        }
        return (
            <>
                <option value="general">일반 30% 공제</option>
                <option value="youth">34세 이하 청년 ( 60만원 + 추가공제 30% )</option>
                <option value="student">대학생 ( 60만원 + 추가공제 30% )</option>
                <option value="senior">65세 이상 ( 20만원 + 추가공제 30% )</option>
                <option value="student_over_35">35세이상 초,중,고등학생 ( 20만원 + 추가공제 30% )</option>
                <option value="disabled">등록장애인 ( 20만원 + 추가공제 30% )</option>
                <option value="disabled_rehab">등록장애인 (직업재활사업 참여 소득) ( 20만원 + 추가공제 50% )</option>
            </>
        );
    };

    return (
        <div className="step-content income-input-step">
            <div className="income-section">
                <div className="step-header">
                    <h2 className="step-section-title">2. 소득정보</h2>
                    <div className="unit-change-badge">
                        <span className="desktop-unit-text">금액 단위 변경 : 입력 칸 <span className="highlight-green">만원</span> 클릭</span>
                        <span className="mobile-unit-text">단위변경 : <span className="highlight-green">만원</span> 클릭</span>
                    </div>
                </div>
                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (가) 근로/사업 소득 
                            <HelpButton label="설명 보기" subject="근로/사업 소득" onClick={() => openHelpPanel?.('earned_income')} />
                        </h5>
                    </div>
                    {formData.earnedIncomes.map((income, index) => (
                        <div className="income-entry-item" key={income.id}>
                            <h6 className="income-item-title" style={{ marginBottom: '12px', color: '#1e293b', fontWeight: 600 }}>
                                {income.label || `가구원 ${index + 1}`} {income.ageGroup ? `( ${getAgeLabel(income.ageGroup)} )` : ''}
                            </h6>
                            <div className="income-entry">
                                <div className="form-group">
                                    <label htmlFor={`earnedIncomeAmount-${income.id}`} className="flex-label">
                                        월 소득 (세전)
                                    </label>
                                    <div className="input-wrapper">
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            id={`earnedIncomeAmount-${income.id}`}
                                            value={formatNumberWithCommas(income.amount)}
                                            onChange={e => handleEarnedIncomeChange(income.id, 'amount', e.target.value)}
                                            onWheel={(e) => (e.target as HTMLElement).blur()}
                                        />
                                        <button type="button" className="unit-toggle" onClick={() => handleEarnedIncomeUnitChange(income.id, 'amountUnit')}>
                                            {income.amountUnit === 'manwon' ? '만원' : '원'}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`earnedIncomePension-${income.id}`} className="flex-label">
                                        국민연금 ( 납부금액 )
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            id={`earnedIncomePension-${income.id}`}
                                            value={formatNumberWithCommas(income.pension)}
                                            onChange={e => handleEarnedIncomeChange(income.id, 'pension', e.target.value)}
                                            onWheel={(e) => (e.target as HTMLElement).blur()}
                                        />
                                        <button type="button" className="unit-toggle" onClick={() => handleEarnedIncomeUnitChange(income.id, 'pensionUnit')}>
                                            {income.pensionUnit === 'manwon' ? '만원' : '원'}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor={`earnedIncomeType-${income.id}`} className="flex-label">
                                        근로소득(사업소득) 공제
                                    </label>
                                    <select 
                                        id={`earnedIncomeType-${income.id}`}
                                        value={income.type}
                                        onChange={e => handleEarnedIncomeChange(income.id, 'type', e.target.value)}
                                    >
                                        {renderOptions(income.ageGroup)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (나) 사적 이전소득
                            <HelpButton label="설명 보기" subject="사적 이전소득" onClick={() => openHelpPanel?.('private_transfer')} />
                        </h5>
                    </div>
                    <div className="form-group">
                        <label>지원금액 유형</label>
                        <div className="radio-group-box private-support-options">
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="privateTransferSame"
                                    name="privateTransferType"
                                    value="same"
                                    checked={formData.privateTransferType === 'same'}
                                    onChange={() => setFormData(prev => ({ ...prev, privateTransferType: 'same' }))}
                                />
                                <label htmlFor="privateTransferSame">매월 같은 금액 지원</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="privateTransferDifferent"
                                    name="privateTransferType"
                                    value="different"
                                    checked={formData.privateTransferType === 'different'}
                                    onChange={() => { setFormData(prev => ({ ...prev, privateTransferType: 'different' })); setShowPrivateTransferInput(true); }}
                                />
                                <label htmlFor="privateTransferDifferent">매월 다른 금액 지원</label>
                            </div>
                        </div>
                    </div>

                    {formData.privateTransferType === 'same' && (
                        <div className="form-group private-transfer-amount-group">
                            <label htmlFor="privateTransferIncome">월 소득액</label>
                            <p className="description">매월 받는 금액을 입력합니다. 기준 중위소득 15%가 공제됩니다.</p>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    id="privateTransferIncome"
                                    value={formatNumberWithCommas(formData.privateTransferIncome)}
                                    onChange={e => setFormData(prev => ({ ...prev, privateTransferIncome: parseFormattedNumber(e.target.value) }))}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                />
                                <button type="button" className="unit-toggle" onClick={() => handleUnitChange('privateTransferIncome')}>
                                    {formData.inputUnits.privateTransferIncome === 'manwon' ? '만원' : '원'}
                                </button>
                            </div>
                        </div>
                    )}
                    {formData.privateTransferType === 'different' && <div className="interest-entry-card private-transfer-entry-card">
                        <div className="interest-entry-heading"><CalculationIcon name="gift" /><strong>월별 지원금액</strong></div>
                        {hasMonthlySupportInput ? <dl className="interest-entry-values">
                            <div><dt>지원받은 월</dt><dd>{receivedMonths}개월</dd></div>
                            <div><dt>입력 금액 합계</dt><dd>{monthlySupportTotal.toLocaleString('ko-KR')}원</dd></div>
                            <div className="private-transfer-summary-type"><dt>지원 유형</dt><dd>{formData.isFrequentPrivateTransfer || receivedMonths >= 6 ? '정기 지원 (6회 이상)' : '비정기 지원'}</dd></div>
                        </dl> : <p className="interest-entry-empty">지원받은 월의 금액과 지원 횟수를 입력해 주세요.</p>}
                        <button type="button" className="interest-entry-button" onClick={() => setShowPrivateTransferInput(true)}>{hasMonthlySupportInput ? '입력 내용 수정' : '월별 지원금액 입력'}</button>
                    </div>}
                </div>
                
                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (다) 공적 이전소득
                            <HelpButton label="설명 보기" subject="공적 이전소득" onClick={() => openHelpPanel?.('public_transfer')} />
                        </h5>
                    </div>
                    <div className="form-group">
                        <label htmlFor="publicTransferIncome">월 소득액</label>
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                inputMode="numeric"
                                id="publicTransferIncome"
                                value={formatNumberWithCommas(formData.publicTransferIncome)}
                                onChange={e => setFormData(prev => ({ ...prev, publicTransferIncome: parseFormattedNumber(e.target.value) }))}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('publicTransferIncome')}>
                                {formData.inputUnits.publicTransferIncome === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (라) 재산소득
                            <HelpButton label="설명 보기" subject="재산소득" onClick={() => openHelpPanel?.('property_income')} />
                        </h5>
                    </div>
                    
                    {/* 임대소득 */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="propertyRentalIncome">임대소득 , 연금소득</label>
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                inputMode="numeric"
                                id="propertyRentalIncome"
                                value={formatNumberWithCommas(formData.propertyRentalIncome)}
                                onChange={e => setFormData(prev => ({ ...prev, propertyRentalIncome: parseFormattedNumber(e.target.value) }))}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('propertyRentalIncome')}>
                                {formData.inputUnits.propertyRentalIncome === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>

                    {/* 이자소득 */}
                    <div className="interest-entry-card">
                        <div className="interest-entry-heading"><CalculationIcon name="interest" /><strong>이자소득</strong><span>2026년에 받은 금액</span></div>
                        {formData.propertyInterestIncome !== '' || formData.propertyInterestMonths !== '' ? <dl className="interest-entry-values">
                            <div><dt>이자소득 총액</dt><dd>{(Number(parseFormattedNumber(formData.propertyInterestIncome || '0')) * (formData.inputUnits.propertyInterestIncome === 'manwon' ? 10000 : 1)).toLocaleString('ko-KR')}원</dd></div>
                            <div><dt>가입기간</dt><dd>{formData.propertyInterestMonths ? `${formData.propertyInterestMonths}개월` : '미입력'}</dd></div>
                        </dl> : <p className="interest-entry-empty">받은 이자소득 총액과 가입기간을 함께 입력해 주세요.</p>}
                        <button type="button" className="interest-entry-button" onClick={() => setShowInterestInput(true)}>{formData.propertyInterestIncome !== '' || formData.propertyInterestMonths !== '' ? '입력 내용 수정' : '이자소득 · 가입기간 입력'}</button>
                    </div>
                </div>

                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (마) 지출요인 공제
                            <HelpButton label="설명 보기" subject="지출비용 공제" onClick={() => openHelpPanel?.('expenditure_deduction')} />
                        </h5>
                    </div>
                    <div className="form-group">
                        <label htmlFor="expenditureDeduction">공제 대상 지출액</label>
                        <div className="input-wrapper">
                            <input 
                                type="text" 
                                inputMode="numeric"
                                id="expenditureDeduction"
                                value={formatNumberWithCommas(formData.expenditureDeduction)}
                                onChange={e => setFormData(prev => ({ ...prev, expenditureDeduction: parseFormattedNumber(e.target.value) }))}
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('expenditureDeduction')}>
                                {formData.inputUnits.expenditureDeduction === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showPrivateTransferInput && <PrivateTransferInputModal
                amounts={formData.privateTransferTwelveMonths}
                units={formData.privateTransferTwelveMonthUnits}
                frequent={formData.isFrequentPrivateTransfer}
                onClose={() => setShowPrivateTransferInput(false)}
                onSave={({ amounts, units, frequent }) => {
                    setFormData(previous => ({ ...previous, privateTransferTwelveMonths: amounts,
                        privateTransferTwelveMonthUnits: units, isFrequentPrivateTransfer: frequent }));
                    setShowPrivateTransferInput(false);
                }}
            />}
            {showInterestInput && <InterestIncomeInputModal
                amount={formData.propertyInterestIncome}
                unit={formData.inputUnits.propertyInterestIncome ?? 'manwon'}
                months={formData.propertyInterestMonths}
                onClose={() => setShowInterestInput(false)}
                onSave={({ amount, unit, months }) => {
                    setFormData(previous => ({ ...previous, propertyInterestIncome: amount, propertyInterestMonths: months,
                        inputUnits: { ...previous.inputUnits, propertyInterestIncome: unit } }));
                    setShowInterestInput(false);
                }}
            />}
        </div>
    );
}
