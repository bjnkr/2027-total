import React from 'react';
import type { UnifiedFormState } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';

interface Props {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (message: string) => void;
    openHelpPanel?: (topic: string) => void;
}

export default function Step3Automobile({ formData, setFormData, setAlertMessage, openHelpPanel }: Props) {
    const handleUnitChange = (field: keyof UnifiedFormState['inputUnits']) => {
        setFormData(prev => ({
            ...prev,
            inputUnits: {
                ...prev.inputUnits,
                [field]: prev.inputUnits[field] === 'manwon' ? 'won' : 'manwon'
            }
        }));
    };

    const handleAutomobileDisabilityTypeChange = (value: string) => {
        setFormData(prev => {
            const next = { ...prev, automobileDisabilityType: value };
            if (value === 'severe') {
                next.isMultiChildHousehold = false;
                next.automobileSeats = '';
            }
            return next;
        });
    };

    const handleAutomobileDisplacementChange = (value: string) => {
        const parsedValue = parseFormattedNumber(value);
        const displacement = parseInt(parsedValue) || 0;

        if (formData.isMultiChildHousehold && displacement >= 2500) {
            setAlertMessage?.("배기량 2500cc 이상 차량은 100% 환산율 적용 자동차 입니다. 복지 지원이 어렵습니다. 복지 담당 공무원에게 문의 바랍니다.");
            setFormData(prev => ({ ...prev, automobileDisplacement: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, automobileDisplacement: parsedValue }));
    };

    const handleAutomobileSeatsChange = (value: string) => {
        const parsedValue = parseFormattedNumber(value);
        const seats = parseInt(parsedValue) || 0;

        const displacement = parseInt(parseFormattedNumber(formData.automobileDisplacement)) || 0;

        // 승차정원은 다자녀 가구의 2,000cc 이상 차량에서만 검증한다.
        if (formData.isMultiChildHousehold && displacement >= 2000 && displacement < 2500 && seats >= 1 && seats < 7) {
            setAlertMessage?.("다자녀 가구 자동차 완화 기준은 2500cc미만 , 7인승 이상 자동차 이면서 , 차령 10년이상 또는 차량가액 500만원 미만 입니다.");
            setFormData(prev => ({ ...prev, automobileSeats: '' }));
            return;
        }

        setFormData(prev => ({ ...prev, automobileSeats: parsedValue }));
    };

    const shouldShowAutomobileSeats = React.useMemo(() => {
        const displacement = parseInt(parseFormattedNumber(formData.automobileDisplacement)) || 0;
        return formData.automobileDisabilityType !== 'severe' && formData.isMultiChildHousehold && displacement >= 2000 && displacement < 2500;
    }, [formData.automobileDisabilityType, formData.automobileDisplacement, formData.isMultiChildHousehold]);

    return (
        <div className="step-content">
            <div className="income-section">
                <div className="step-header">
                    <h2 className="step-section-title">3. 자동차</h2>
                    <div className="unit-change-badge">
                        <span className="desktop-unit-text">금액 단위 변경 : 입력 칸 <span className="highlight-green">만원</span> 클릭</span>
                        <span className="mobile-unit-text">단위변경 : <span className="highlight-green">만원</span> 클릭</span>
                    </div>
                </div>
                <div className="section-alert">
                    <div className="alert-item">
                        <span className="bullet">&bull;</span>
                        <span className="warning-text">생업용 자동차 금액은 <br className="mobile-br" />입력하지 마세요.</span>
                        <button 
                            type="button" 
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                cursor: 'pointer', 
                                color: '#ef4444', 
                                display: 'inline-flex', 
                                alignItems: 'center' 
                            }} 
                            onClick={() => openHelpPanel && openHelpPanel('automobile_business')}
                            aria-label="생업용 자동차 도움말"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', verticalAlign: 'middle', marginTop: '-2px' }}>
                                <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="none" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="#ffffff" strokeWidth="2.5" />
                                <path d="M12 17h.01" stroke="#ffffff" strokeWidth="2.5" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="automobileDisabilityType" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <circle cx="12" cy="5" r="1" />
                                <path d="m9 20 3-6 3 6" />
                                <path d="m6 8 6 2 6-2" />
                                <path d="M12 10v4" />
                            </svg>
                            장애인 사용 여부
                        </label>
                        <p className="description">운전자 본인 또는 가구원에 해당하는 분이 계시면 선택하세요.</p>
                        <select 
                            id="automobileDisabilityType" 
                            value={formData.automobileDisabilityType} 
                            onChange={e => handleAutomobileDisabilityTypeChange(e.target.value)}
                        >
                            <option value="none">해당사항 없음</option>
                            <option value="mild">장애정도가 심하지 않은 장애인</option>
                            <option value="severe">장애정도가 심한 장애인</option>
                        </select>
                    </div>

                    {formData.automobileDisabilityType !== 'severe' && (
                        <div className="form-group">
                            <label className="flex-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                다자녀 가구 여부
                            </label>
                            <p className="description">다자녀(18세미만 자녀 2인 이상) / 다인 가구(6인이상) 여부</p>
                            <select name="isMultiChildHousehold" value={formData.isMultiChildHousehold ? 'true' : 'false'} onChange={(e) => setFormData(prev => ({ ...prev, isMultiChildHousehold: e.target.value === 'true' }))}>
                                <option value="false">해당사항 없음</option>
                                <option value="true">다자녀 / 다인 가구</option>
                            </select>
                        </div>
                    )}

                    <hr className="automobile-fields-divider" />
                    <div className="form-group">
                        <label htmlFor="automobileDisplacement" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="m12 14 4-4"/>
                                <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                            </svg>
                            배기량
                        </label>
                        <p className="description">차량의 배기량(CC)을 입력하세요.</p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="automobileDisplacement"
                                value={formatNumberWithCommas(formData.automobileDisplacement)}
                                onChange={e => handleAutomobileDisplacementChange(e.target.value)} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <span className="unit-display-text">cc</span>
                        </div>
                    </div>

                    {shouldShowAutomobileSeats && (
                        <div className="form-group">
                            <label htmlFor="automobileSeats" className="flex-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <polyline points="16 11 18 11 22 11"></polyline>
                                </svg>
                                승차정원
                            </label>
                            <p className="description">다자녀 자동차 완화 기준 적용을 위해 필요합니다.</p>
                            <div className="input-wrapper">
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    id="automobileSeats"
                                    value={formatNumberWithCommas(formData.automobileSeats)}
                                    onChange={e => handleAutomobileSeatsChange(e.target.value)}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                />
                                <span className="unit-display-text">인승</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="automobileRegistrationDate" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            등록일자 (연도 , 연식)
                        </label>
                        <p className="description">자동차등록증의 최초 등록 연도(연식)를 입력하세요.</p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="automobileRegistrationDate"
                                value={formData.automobileRegistrationDate}
                                onChange={e => setFormData(prev => ({ ...prev, automobileRegistrationDate: parseFormattedNumber(e.target.value) }))}
                                maxLength={4}
                            />
                            <span className="unit-display-text">년</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="automobileProperty" className="flex-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                                    <path d="M12 18V6"></path>
                                </svg>
                                자동차가액
                            </div>
                            <a href="https://www.kidi.or.kr/user/car/carprice.do" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: '#16a34a', border: '1px solid #16a34a', padding: '2px 8px', borderRadius: '4px', textDecoration: 'none', backgroundColor: '#f0fdf4', display: 'inline-block' }}>차량가액 조회</a>
                        </label>
                        <p className="description">
                            보험개발원 차량기준가액을 입력하세요.
                        </p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="automobileProperty"
                                value={formatNumberWithCommas(formData.automobileProperty)}
                                onChange={e => setFormData(prev => ({ ...prev, automobileProperty: parseFormattedNumber(e.target.value) }))} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('automobileProperty')}>
                                {formData.inputUnits.automobileProperty === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>

                </div>
            </div> 
            <p className="no-car-text-btn">
                자동차가 없으시면 다음을 클릭하세요
            </p>
        </div>
    );
}
