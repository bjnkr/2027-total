import HelpButton from './HelpButton';
import React, { useMemo } from 'react';
import type { UnifiedFormState } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';

interface Props {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (msg: string) => void;
    openHelpPanel?: (topic: string) => void;
}

export default function Step4PropertyDebt({ formData, setFormData, openHelpPanel }: Props) {
    const handleUnitChange = (field: keyof UnifiedFormState['inputUnits']) => {
        setFormData(prev => ({
            ...prev,
            inputUnits: {
                ...prev.inputUnits,
                [field]: prev.inputUnits[field] === 'manwon' ? 'won' : 'manwon'
            }
        }));
    };

    const residentialPropertyUI = useMemo(() => {
        switch (formData.housingType) {
            case 'owned': return { label: '공시지가', description: '거주 중인 주택, 아파트 등의 공시지가' };
            case 'jeonse': return { label: '전세(월세) 보증금', description: '전세(월세) 보증금 금액' };
            case 'wolse': return { label: '월세 보증금', description: '월세 보증금 금액' };
            case 'free': return { label: '주거용 재산', description: '무료임차 시 해당 사항 없음 (0원 입력)' };
            default: return { label: '주거용 재산', description: '거주 중인 주택, 아파트 등의 공시지가' };
        }
    }, [formData.housingType]);

    return (
        <div className="step-content">
            <div className="income-section">
                <div className="step-header">
                    <h2 className="step-section-title" style={{ display: 'flex', alignItems: 'center' }}>
                        4. 재산 / 부채
                        <HelpButton label="입력 도움말" subject="재산 / 부채" onClick={() => openHelpPanel?.('property_debt')} />
                    </h2>
                    <div className="unit-change-badge">
                        <span className="desktop-unit-text">금액 단위 변경 : 입력 칸 <span className="highlight-green">만원</span> 클릭</span>
                        <span className="mobile-unit-text">단위변경 : <span className="highlight-green">만원</span> 클릭</span>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }}></div>
                <div className="form-grid">
                    <fieldset className="form-group region-field" style={{ gridColumn: '1 / -1' }}>
                        <legend className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            거주 지역
                        </legend>
                        <div id="region" className="region-options">
                            {[
                                { value: 'seoul', label: '서울' },
                                { value: 'gyeonggi', label: '경기' },
                                { value: 'metro', label: '광역·세종·창원' },
                                { value: 'other', label: '그 외 지역' },
                            ].map(region => <label className="region-option" key={region.value}>
                                <input type="radio" name="region" value={region.value} checked={formData.region === region.value} onChange={() => setFormData(previous => ({ ...previous, region: region.value }))} />
                                <span>{region.label}</span>
                            </label>)}
                        </div>
                    </fieldset>
                    <div className="form-group">
                        <label className="flex-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            주거 형태
                        </label>
                        <p className="description">주거 형태를 선택하세요.</p>
                        <select 
                            value={formData.housingType} 
                            onChange={(e) => setFormData(prev => ({ ...prev, housingType: e.target.value }))}
                        >
                            <option value="jeonse">전/월세</option>
                            <option value="owned">자가</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="M3 21h18"/>
                                <path d="M5 21V7l8-4 8 4v14"/>
                                <path d="M8 21v-2a4 4 0 0 1 8 0v2"/>
                            </svg>
                            {residentialPropertyUI.label}
                        </label>
                        <p className="description">{residentialPropertyUI.description}</p>
                        <div className="input-wrapper">
                                <input 
                                type="text"
                                inputMode="numeric"
                                id="residentialProperty"
                                value={formatNumberWithCommas(formData.residentialProperty)}
                                onChange={e => setFormData(prev => ({ ...prev, residentialProperty: parseFormattedNumber(e.target.value) }))} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('residentialProperty')}>
                                {formData.inputUnits.residentialProperty === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                    <div className="property-group-separator"></div>
                    <div className="form-group">
                        <label htmlFor="generalProperty" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                            일반 재산
                        </label>
                            <p className="description">주거용 외 부동산,토지,분양권,회원권 등</p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="generalProperty"
                                value={formatNumberWithCommas(formData.generalProperty)}
                                onChange={e => setFormData(prev => ({ ...prev, generalProperty: parseFormattedNumber(e.target.value) }))} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                                <button type="button" className="unit-toggle" onClick={() => handleUnitChange('generalProperty')}>
                                {formData.inputUnits.generalProperty === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="financialProperty" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="m3 5 4 14 5-14 5 14 4-14M2 10h20M2 14h20"></path>
                            </svg>
                            금융 재산
                        </label>
                        <p className="description">예금, 적금, 주식, 보험해지 환급금 등</p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="financialProperty"
                                value={formatNumberWithCommas(formData.financialProperty)}
                                onChange={e => setFormData(prev => ({ ...prev, financialProperty: parseFormattedNumber(e.target.value) }))} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('financialProperty')}>
                                {formData.inputUnits.financialProperty === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                    <div className="property-group-separator"></div>
                        <div className="form-group">
                        <label htmlFor="debt" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon debt-icon">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            부채 : 
                        </label>
                        <p className="description">금융회사등으로부터 받은 대출금<br /><span style={{ color: '#dc3545' }}>(주의)</span> 마이너스 대출, 단기 카드론, 개인간의 채무는 입력하지 마세요</p>
                        <div className="input-wrapper">
                            <input 
                                type="text"
                                inputMode="numeric"
                                id="debt"
                                value={formatNumberWithCommas(formData.debt)}
                                onChange={e => setFormData(prev => ({ ...prev, debt: parseFormattedNumber(e.target.value) }))} 
                                onWheel={(e) => (e.target as HTMLElement).blur()}
                            />
                            <button type="button" className="unit-toggle" onClick={() => handleUnitChange('debt')}>
                                {formData.inputUnits.debt === 'manwon' ? '만원' : '원'}
                            </button>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    );
}
