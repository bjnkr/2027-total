import React from 'react';
import type { UnifiedFormState } from '../types';

interface Props {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (msg: string) => void;
    openHelpPanel?: (topic: string) => void;
}

export default function Step1BasicInfo({ formData, setFormData, openHelpPanel }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const nextState = { ...prev, [name]: value };
            if (name === 'householdSize' && value === '1') {
                nextState.isSingleParent = false;
            }
            return nextState;
        });
    };

    return (
        <div className="step-content">
            <div className="income-section">
                <div className="step-header">
                    <h2 className="step-section-title" style={{ display: 'flex', alignItems: 'center' }}>
                        1. 기본정보
                        <button type="button" className="help-btn" onClick={() => openHelpPanel && openHelpPanel('basic_info')} aria-label="도움말">?</button>
                    </h2>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', marginBottom: '1.5rem' }}></div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="householdSize" className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            가구원 수
                        </label>
                        <select id="householdSize" name="householdSize" value={formData.householdSize} onChange={handleChange}>
                            <option value="1">1인 가구</option>
                            <option value="2">2인 가구</option>
                            <option value="3">3인 가구</option>
                            <option value="4">4인 가구</option>
                            <option value="5">5인 가구</option>
                            <option value="6">6인 가구</option>
                            <option value="7">7인 가구</option>
                            <option value="8">8인 가구</option>
                            <option value="9">9인 가구</option>
                            <option value="10">10인 가구</option>
                        </select>
                    </div>
                    {/* 통합 폼 추가 필드: 한부모 가족 여부 */}
                    {formData.householdSize !== '1' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            한부모 가족 여부
                        </label>
                        <div className="radio-group-box" style={{ marginTop: '0.5rem' }}>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="singleParentYes"
                                    name="isSingleParent"
                                    checked={formData.isSingleParent === true}
                                    onChange={() => setFormData(prev => ({ ...prev, isSingleParent: true }))}
                                />
                                <label htmlFor="singleParentYes">예</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="singleParentNo"
                                    name="isSingleParent"
                                    checked={formData.isSingleParent === false}
                                    onChange={() => setFormData(prev => ({ ...prev, isSingleParent: false }))}
                                />
                                <label htmlFor="singleParentNo">아니오</label>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* 통합 폼 추가 필드: 재산특례여부 */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="flex-label">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            재산특례여부
                        </label>
                        <div className="radio-group-box" style={{ marginTop: '0.5rem' }}>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="propertyExceptionYes"
                                    name="hasPropertyException"
                                    checked={formData.hasPropertyException === true}
                                    onChange={() => setFormData(prev => ({ ...prev, hasPropertyException: true }))}
                                />
                                <label htmlFor="propertyExceptionYes">예</label>
                            </div>
                            <div className="radio-option">
                                <input
                                    type="radio"
                                    id="propertyExceptionNo"
                                    name="hasPropertyException"
                                    checked={formData.hasPropertyException === false}
                                    onChange={() => setFormData(prev => ({ ...prev, hasPropertyException: false }))}
                                />
                                <label htmlFor="propertyExceptionNo">아니오</label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
