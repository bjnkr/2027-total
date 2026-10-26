import React from 'react';
import type { UnifiedFormState } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';

interface Props {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (msg: string) => void;
    openHelpPanel?: (topic: string) => void;
}

export default function Step2IncomeInfo({ formData, setFormData, openHelpPanel }: Props) {
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

    const handlePrivateTransferTwelveMonthChange = (index: number, value: string) => {
        setFormData(prev => {
            const newMonths = [...prev.privateTransferTwelveMonths];
            newMonths[index] = parseFormattedNumber(value);
            
            const validCount = newMonths.filter(m => {
                const num = parseFloat(m);
                return !isNaN(num) && num > 0;
            }).length;

            return { 
                ...prev, 
                privateTransferTwelveMonths: newMonths,
                isFrequentPrivateTransfer: validCount >= 6 ? true : prev.isFrequentPrivateTransfer
            };
        });
    };

    const handlePrivateTransferMonthUnitChange = (index: number) => {
        setFormData(prev => {
            const newUnits = [...prev.privateTransferTwelveMonthUnits];
            newUnits[index] = newUnits[index] === 'manwon' ? 'won' : 'manwon';
            return { ...prev, privateTransferTwelveMonthUnits: newUnits };
        });
    };

    const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

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
        <div className="step-content">
            <div className="income-section">
                <div className="step-header">
                    <h2 className="step-section-title">2. 소득정보</h2>
                    <div className="unit-change-badge">
                        <span className="desktop-unit-text">금액 단위 변경 : 입력 칸 <span className="highlight-green">만원</span> 클릭</span>
                        <span className="mobile-unit-text">단위변경 :<br /> <span className="highlight-green">만원</span>클릭</span>
                    </div>
                </div>
                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (가) 근로/사업 소득 
                            <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('earned_income')} aria-label="도움말">?</button>
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
                            <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('private_transfer')} aria-label="도움말">?</button>
                        </h5>
                    </div>
                    <div className="form-group">
                        <label>지원금액 유형</label>
                        <div className="radio-group-box">
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
                                    onChange={() => setFormData(prev => ({ ...prev, privateTransferType: 'different' }))}
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
                    {formData.privateTransferType === 'different' && (
                        <>
                            <div className="form-group">
                                <div className="checkbox-group-box">
                                    <label>지원 횟수 (선택)</label>
                                    <div className="checkbox-option">
                                        <input
                                            type="checkbox"
                                            id="isFrequentPrivateTransfer"
                                            checked={formData.isFrequentPrivateTransfer}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isFrequentPrivateTransfer: e.target.checked }))}
                                        />
                                        <label htmlFor="isFrequentPrivateTransfer">6회 이상 (정기 지원)</label>
                                        <span className="checkbox-description">
                                            (입력한 개월 수와 무관하게, 최근 1년간 실제 지원(입금)받은 총 횟수가 6회 이상인 경우 선택하세요.)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group monthly-grid-group">
                                <label>월별 지원 금액</label>
                                <p className="description">
                                    실제 지원받은 월의 금액을 입력하세요. 입력하지 않은 월은 0원으로 처리됩니다.
                                </p>
                                <div className="twelve-month-grid">
                                    {formData.privateTransferTwelveMonths.map((value, index) => (
                                        <div className="form-group month-input-group" key={index}>
                                            <label htmlFor={`privateTransferMonth-${index + 1}`}>{monthLabels[index]}</label>
                                            <div className="input-wrapper">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    id={`privateTransferMonth-${index + 1}`}
                                                    value={formatNumberWithCommas(value)}
                                                    onChange={e => handlePrivateTransferTwelveMonthChange(index, e.target.value)}
                                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                                />
                                                <button
                                                    type="button"
                                                    className="unit-display"
                                                    onClick={() => handlePrivateTransferMonthUnitChange(index)}
                                                >
                                                    {formData.privateTransferTwelveMonthUnits[index] === 'manwon' ? '만원' : '원'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (다) 공적 이전소득
                            <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('public_transfer')} aria-label="도움말">?</button>
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
                            <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('property_income')} aria-label="도움말">?</button>
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
                    <div className="form-grid" style={{ alignItems: 'end' }}>
                        <div className="form-group">
                            <label htmlFor="propertyInterestIncome">이자소득 <span style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal'}}>(2026년에 받은 금액)</span></label>
                            <div className="input-wrapper">
                                <input 
                                    type="text" 
                                    inputMode="numeric"
                                    id="propertyInterestIncome"
                                    value={formatNumberWithCommas(formData.propertyInterestIncome)}
                                    onChange={e => setFormData(prev => ({ ...prev, propertyInterestIncome: parseFormattedNumber(e.target.value) }))}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                />
                                <button type="button" className="unit-toggle" onClick={() => handleUnitChange('propertyInterestIncome')}>
                                    {formData.inputUnits.propertyInterestIncome === 'manwon' ? '만원' : '원'}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="propertyInterestMonths">가입기간 ( 이자소득 )</label>
                            <div className="input-wrapper">
                                <input 
                                    type="number" 
                                    inputMode="numeric"
                                    id="propertyInterestMonths"
                                    value={formData.propertyInterestMonths}
                                    onChange={e => setFormData(prev => ({ ...prev, propertyInterestMonths: e.target.value }))}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                    min="0"
                                />
                                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>개월</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="income-category">
                    <div className="income-title-wrapper">
                        <h5 style={{ display: 'flex', alignItems: 'center' }}>
                            (마) 지출요인 공제
                            <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('expenditure_deduction')} aria-label="도움말">?</button>
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
        </div>
    );
}
