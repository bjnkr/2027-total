import { useState } from 'react';
import type { CalculationResults, UnifiedFormState, CalculationDetails } from '../types';
import CalculationDetailsModal from './CalculationDetailsModal';
import { MEDIAN_INCOME } from '../App';

interface ResultDashboardProps {
    formData: UnifiedFormState;
    results: CalculationResults;
    onReset: () => void;
    onNavigate: (step: number) => void;
    isSingleParentOnlyMode?: boolean;
}

export default function ResultDashboard({ formData, results, onReset, onNavigate, isSingleParentOnlyMode = false }: ResultDashboardProps) {
    const [modalConfig, setModalConfig] = useState<{
        title: string; details: CalculationDetails; finalIncome: number;
        medicalDetails?: CalculationDetails; medicalIncome?: number; excludePrivateTransfer?: boolean;
    } | null>(null);
    const [expandedGichoItem, setExpandedGichoItem] = useState<string | null>(null);
    const [showRentModal, setShowRentModal] = useState(false);
    const [userRentStr, setUserRentStr] = useState('');
    const [rentInputUnit, setRentInputUnit] = useState<'won'|'manwon'>('manwon');
    const [customHousingBenefit, setCustomHousingBenefit] = useState<number | null>(null);
    const [showStepModal, setShowStepModal] = useState(false);
    const [housingCalcDetails, setHousingCalcDetails] = useState<{
        rentAmount: number;
        depositConversion: number;
        actualRent: number;
        standardRent: number;
        rentToUse: number;
        selfBurden: number;
    } | null>(null);

    const [isIncheon, setIsIncheon] = useState(false);

    const toggleGichoItem = (item: string) => {
        if (expandedGichoItem === item) setExpandedGichoItem(null);
        else setExpandedGichoItem(item);
    };

    if (!results.data) return null;

    const { gicho, hanbumo, chasangwi, chasangwiMedical } = results.data;
    
    const householdSize = formData.householdSize as keyof typeof MEDIAN_INCOME;
    const medianIncome = MEDIAN_INCOME[householdSize] || 2736042;

    // Thresholds
    const thresholdGichoLivelihood = gicho?.thresholdLivelihood || Math.floor(medianIncome * 0.32);
    const thresholdGichoMedical = gicho?.thresholdMedical || Math.floor(medianIncome * 0.40);
    const thresholdGichoHousing = gicho?.thresholdHousing || Math.floor(medianIncome * 0.48);
    const thresholdGichoEducation = gicho?.thresholdEducation || Math.floor(medianIncome * 0.50);
    const thresholdChasangwi = chasangwi?.threshold || Math.floor(medianIncome * 0.50);

    const handleCalculateHousingBenefit = () => {
        const rawRentStr = userRentStr.replace(/,/g, '');
        const rentAmountRaw = parseInt(rawRentStr) || 0;
        const rentAmount = rentInputUnit === 'manwon' ? rentAmountRaw * 10000 : rentAmountRaw;
        const region = formData.region;
        const size = Math.min(parseInt(formData.householdSize) || 1, 7);
        const income = gicho?.income || 0;
        const depositRaw = parseInt(formData.residentialProperty.replace(/,/g, '')) || 0;
        const depositMultiplier = formData.inputUnits?.residentialProperty === 'won' ? 1 : 10000;
        const deposit = depositRaw * depositMultiplier;

        const STANDARD_RENT: Record<string, number[]> = {
            'seoul': [0, 381000, 431000, 514000, 596000, 618000, 731000, 731000],
            'gyeonggi': [0, 313000, 352000, 422000, 488000, 505000, 599000, 599000],
            'metro': [0, 259000, 291000, 347000, 403000, 418000, 492000, 492000],
            'other': [0, 234000, 265000, 318000, 369000, 382000, 452000, 452000]
        };

        let housingRegion = region;
        if (region === 'metro' && isIncheon) {
            housingRegion = 'gyeonggi';
        }

        const standardRent = STANDARD_RENT[housingRegion]?.[size] || STANDARD_RENT['seoul'][1];
        const depositConversion = deposit * 0.04 / 12;
        const actualRent = rentAmount + depositConversion;
        const rentToUse = Math.min(standardRent, actualRent);
        
        let benefit = rentToUse;
        let selfBurden = 0;
        if (income > thresholdGichoLivelihood) {
            selfBurden = (income - thresholdGichoLivelihood) * 0.3;
            benefit = Math.max(0, rentToUse - selfBurden);
        }
        
        setCustomHousingBenefit(Math.floor(benefit));
        setHousingCalcDetails({
            rentAmount,
            depositConversion,
            actualRent,
            standardRent,
            rentToUse,
            selfBurden
        });
        setShowRentModal(false);
    };

    return (
        <div className="result-page-container details-visible" style={{ marginTop: '30px' }}>
            <div style={{ backgroundColor: '#fff7ed', color: '#9a3412', padding: '16px 20px', borderRadius: '8px', marginBottom: '25px', fontSize: '14.5px', lineHeight: '1.6', border: '1px solid #fdba74', borderLeft: '5px solid #f97316', boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '20px', marginTop: '-2px' }}>⚠️</span>
                    <div>
                        <p style={{ margin: '0 0 8px 0' }}><strong>1.</strong> 모의계산 결과는 <strong>실제 심사 결과와 다를 수 있습니다.</strong> 반드시 참고용으로만 활용하시길 바랍니다.</p>
                        <p style={{ margin: '0' }}><strong>2.</strong> 부양의무자의 소득과 재산이 일정기준 보다 적어야 지원이 가능합니다. (생계급여, 의료급여, 차상위 본인부담 경감)</p>
                    </div>
                </div>
            </div>
            {isSingleParentOnlyMode && (
                <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                    자동차 기준 예외로 인해 '한부모 가족 지원' 모의 계산 결과만 제공됩니다.
                </div>
            )}
            <div className="benefit-cards-layout">
                {/* Left Column */}
                {!isSingleParentOnlyMode && (
                <div className="benefit-column left-column">
                    <div className="benefit-card style-gicho">
                        <div className="card-title-decor">
                            <div className="decor-line left"></div>
                            <h3>국민기초생활보장</h3>
                            <div className="decor-line right"></div>
                        </div>

                        <div className="income-summary-box" style={gicho?.medicalIncome !== undefined && gicho.medicalIncome !== gicho.income ? { flexDirection: 'column', alignItems: 'stretch', gap: '10px' } : undefined}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                                <span className="income-label-box" style={{ wordBreak: 'keep-all' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    {gicho?.medicalIncome !== undefined && gicho.medicalIncome !== gicho.income ? '소득인정액 (생계, 주거, 교육)' : '소득인정액'}
                                </span>
                                <span className="income-amount-box" style={{ marginLeft: 'auto' }}>{gicho?.income?.toLocaleString()} <span style={{fontSize:'0.9rem', color:'#64748b', fontWeight:500}}>원</span></span>
                            </div>
                            
                            {gicho?.medicalIncome !== undefined && gicho.medicalIncome !== gicho.income && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', width: '100%' }}>
                                    <span className="income-label-box" style={{ fontSize: '0.9rem', wordBreak: 'keep-all' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                                        소득인정액 (의료급여)
                                    </span>
                                    <span className="income-amount-box" style={{ fontSize: '1.1rem', marginLeft: 'auto' }}>{gicho.medicalIncome.toLocaleString()} <span style={{fontSize:'0.8rem', color:'#64748b', fontWeight:500}}>원</span></span>
                                </div>
                            )}
                        </div>

                        {gicho?.medicalIncome !== undefined && gicho.medicalIncome !== gicho.income && (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '-15px', marginBottom: '15px', textAlign: 'right' }}>
                                ※ 의료급여 산정 시, '일반 공제' 30%는 적용되지 않습니다.
                            </p>
                        )}



                        <div className="benefit-list">
                            <div className="benefit-item-card livelihood">
                                <div className="benefit-item-header" onClick={() => toggleGichoItem('livelihood')}>
                                    <div className="benefit-item-info">
                                        <span className="benefit-name">🍚 생계급여</span>
                                        <span className="benefit-criteria">선정기준: {thresholdGichoLivelihood.toLocaleString()}원</span>
                                        {gicho?.livelihoodEligible && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                                                <svg style={{ transition: 'transform 0.3s', transform: expandedGichoItem === 'livelihood' ? 'rotate(180deg)' : 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                <span>상세보기</span>
                                            </span>
                                        )}
                                    </div>
                                    {gicho?.livelihoodEligible && gicho?.livelihoodBenefitAmount !== undefined && gicho.livelihoodBenefitAmount > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span className="status-badge possible" style={{ marginBottom: '6px' }}>가능</span>
                                            <div style={{ color: '#1d4ed8', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                {(Math.ceil(gicho.livelihoodBenefitAmount / 10) * 10).toLocaleString()}<span style={{fontSize: '0.9rem', marginLeft: '2px', color: '#1e293b'}}>원</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`status-badge ${gicho?.livelihoodEligible ? 'possible' : 'impossible'}`}>
                                            {gicho?.livelihoodEligible ? '가능' : '불가능'}
                                        </span>
                                    )}
                                </div>
                                {expandedGichoItem === 'livelihood' && gicho?.livelihoodEligible && (
                                    <div className="benefit-item-details">
                                        <p style={{fontWeight: 'bold', marginBottom: '8px', color: '#1e293b'}}>생계급여 산출 방식</p>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                            <span>선정기준액:</span>
                                            <span>{thresholdGichoLivelihood.toLocaleString()} 원</span>
                                        </div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                                            <span>소득인정액:</span>
                                            <span>(-) {gicho.income.toLocaleString()} 원</span>
                                        </div>
                                        <div style={{borderTop: '1px solid #cbd5e1', margin: '8px 0'}}></div>
                                        <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1d4ed8'}}>
                                            <span>예상 수급액:</span>
                                            <span>{gicho.livelihoodBenefitAmount ? (Math.ceil(gicho.livelihoodBenefitAmount / 10) * 10).toLocaleString() : 0} 원</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="benefit-item-card medical">
                                <div className="benefit-item-header" onClick={() => toggleGichoItem('medical')}>
                                    <div className="benefit-item-info">
                                        <span className="benefit-name">🏥 의료급여</span>
                                        <span className="benefit-criteria">선정기준: {thresholdGichoMedical.toLocaleString()}원</span>
                                        {gicho?.medicalEligible && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                                                <svg style={{ transition: 'transform 0.3s', transform: expandedGichoItem === 'medical' ? 'rotate(180deg)' : 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                <span>상세보기</span>
                                            </span>
                                        )}
                                    </div>
                                    <span className={`status-badge ${gicho?.medicalEligible ? 'possible' : 'impossible'}`}>
                                        {gicho?.medicalEligible ? '가능' : '불가능'}
                                    </span>
                                </div>
                                {expandedGichoItem === 'medical' && gicho?.medicalEligible && (
                                    <div className="benefit-item-details">
                                        <p style={{fontWeight: 'bold', marginBottom: '8px', color: '#1e293b'}}>의료급여 안내</p>
                                        <p>의료급여는 현금 지급이 아닌, 의료비(병원비, 약제비 등) 본인부담금을 지원하거나 면제해주는 제도입니다.</p>
                                    </div>
                                )}
                            </div>

                            <div className="benefit-item-card housing">
                                <div className="benefit-item-header" onClick={() => toggleGichoItem('housing')}>
                                    <div className="benefit-item-info">
                                        <span className="benefit-name">🏠 주거급여</span>
                                        <span className="benefit-criteria">선정기준: {thresholdGichoHousing.toLocaleString()}원</span>
                                        {gicho?.housingEligible && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                                                <svg style={{ transition: 'transform 0.3s', transform: expandedGichoItem === 'housing' ? 'rotate(180deg)' : 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                <span>상세보기</span>
                                            </span>
                                        )}
                                    </div>
                                    {gicho?.housingEligible ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <span className="status-badge possible" style={{ marginBottom: '6px' }}>가능</span>
                                            {gicho.housingBenefitAmount === -1 ? (
                                                <div style={{ color: '#1d4ed8', fontSize: '1rem', fontWeight: 'bold' }}>수선유지급여</div>
                                            ) : customHousingBenefit !== null ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                    <div style={{ color: '#1d4ed8', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                        {(Math.ceil(customHousingBenefit / 10) * 10).toLocaleString()}<span style={{fontSize: '0.9rem', marginLeft: '2px', color: '#1e293b'}}>원</span>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); setShowRentModal(true); }} style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                                                        월세 수정
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); setShowRentModal(true); }} style={{ padding: '8px 14px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '6px', fontSize: '0.9rem', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 3px 6px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                                    예상금액 조회
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className={`status-badge impossible`}>
                                            불가능
                                        </span>
                                    )}
                                </div>
                                {expandedGichoItem === 'housing' && gicho?.housingEligible && gicho.housingBenefitAmount !== -1 && (
                                    <div className="benefit-item-details">
                                        <p style={{fontWeight: 'bold', marginBottom: '8px', color: '#1e293b'}}>주거급여(전/월세) 산출 방식</p>
                                        {housingCalcDetails ? (
                                            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '12px' }}>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <p style={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{fontSize: '1.1rem'}}>🏠</span> 1. 지원 기준 금액 설정</p>
                                                    <ul style={{ margin: 0, paddingLeft: '24px', color: '#475569', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                                        <li>실제 임차료 (보증금환산액 + 월세): {Math.floor(housingCalcDetails.actualRent).toLocaleString()}원</li>
                                                        <li>지역별 최대 지원 한도: {housingCalcDetails.standardRent.toLocaleString()}원</li>
                                                        <li><strong>적용 기준액 (둘 중 작은 값): <span style={{color: '#2563eb'}}>{Math.floor(Math.min(housingCalcDetails.actualRent, housingCalcDetails.standardRent)).toLocaleString()}원</span></strong></li>
                                                    </ul>
                                                </div>
                                                
                                                {housingCalcDetails.selfBurden > 0 && (
                                                    <div style={{ marginBottom: '12px', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                                                        <p style={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{fontSize: '1.1rem'}}>➖</span> 2. 자기부담금 차감</p>
                                                        <ul style={{ margin: 0, paddingLeft: '24px', color: '#ef4444', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                                            <li>소득이 생계급여 기준을 초과하여 발생한 본인 부담금: <strong>- {Math.floor(housingCalcDetails.selfBurden).toLocaleString()}원</strong></li>
                                                        </ul>
                                                    </div>
                                                )}

                                                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{fontSize: '1.1rem'}}>🟰</span> 최종 주거급여 예상액</span>
                                                    <span style={{ fontWeight: 'bold', color: '#1d4ed8', fontSize: '1.2rem' }}>{(Math.ceil(Math.max(0, Math.floor(Math.min(housingCalcDetails.actualRent, housingCalcDetails.standardRent) - housingCalcDetails.selfBurden)) / 10) * 10).toLocaleString()}원</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p>지역별 기준 임대료와 실제 지불하는 임차료(보증금 환산액 + 월세) 중 적은 금액이 지원됩니다.</p>
                                                {gicho.income > thresholdGichoLivelihood && (
                                                    <p style={{marginTop: '4px', color: '#ef4444'}}>※ 소득인정액이 생계급여 기준을 초과하여 자기부담분(초과분의 30%)이 차감되었습니다.</p>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                                {expandedGichoItem === 'housing' && gicho?.housingEligible && gicho.housingBenefitAmount === -1 && (
                                    <div className="benefit-item-details">
                                        <p style={{fontWeight: 'bold', marginBottom: '8px', color: '#1e293b'}}>주거급여 산출 방식</p>
                                        <p>자가 가구의 경우 현금 지원 대신 주택 수선 지원(수선유지급여)이 제공됩니다.</p>
                                    </div>
                                )}
                            </div>

                            <div className="benefit-item-card education">
                                <div className="benefit-item-header" onClick={() => toggleGichoItem('education')}>
                                    <div className="benefit-item-info">
                                        <span className="benefit-name">📚 교육급여</span>
                                        <span className="benefit-criteria">선정기준: {thresholdGichoEducation.toLocaleString()}원</span>
                                        {gicho?.educationEligible && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                                                <svg style={{ transition: 'transform 0.3s', transform: expandedGichoItem === 'education' ? 'rotate(180deg)' : 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                <span>상세보기</span>
                                            </span>
                                        )}
                                    </div>
                                    <span className={`status-badge ${gicho?.educationEligible ? 'possible' : 'impossible'}`}>
                                        {gicho?.educationEligible ? '가능' : '불가능'}
                                    </span>
                                </div>
                                {expandedGichoItem === 'education' && gicho?.educationEligible && (
                                    <div className="benefit-item-details">
                                        <p style={{fontWeight: 'bold', marginBottom: '8px', color: '#1e293b'}}>교육급여 안내</p>
                                        <p>초·중·고등학생 자녀가 있는 경우 교육활동지원비(바우처)가 연 1회 지급되며, 입학금, 수업료, 교과서대금도 지원됩니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {gicho?.details && (
                            <button className="details-btn-styled" onClick={() => setModalConfig({ title: '국민기초생활보장 상세내역', details: gicho.details!, finalIncome: gicho.income, medicalDetails: gicho.medicalDetails, medicalIncome: gicho.medicalIncome })}>
                                계산 내역 보기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        )}
                    </div>
                </div>
                )}

                {/* Right Column */}
                <div className="benefit-column right-column">
                    {!isSingleParentOnlyMode && (
                        <>
                    {!(gicho?.livelihoodEligible || gicho?.medicalEligible || gicho?.housingEligible) && (
                        <div className="benefit-card style-chasangwi">
                            <div className="card-title-decor">
                                <div className="decor-line left"></div>
                                <h3>차상위계층 확인</h3>
                                <div className="decor-line right"></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <span className="income-label-box">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    소득인정액
                                </span>
                                <span className="income-amount-box">{chasangwi?.income?.toLocaleString()} <span style={{fontSize:'0.9rem', color:'#64748b', fontWeight:500}}>원</span></span>
                            </div>

                            <div className="benefit-item single-item">
                                <span className="benefit-criteria">선정기준: {thresholdChasangwi.toLocaleString()}원</span>
                                <span className={`status-badge ${chasangwi?.eligible ? 'possible' : 'impossible'}`}>
                                    {chasangwi?.eligible ? '가능' : '불가능'}
                                </span>
                            </div>

                            {chasangwi?.details && (
                                <button className="details-btn-styled" onClick={() => setModalConfig({ title: '차상위계층 상세내역', details: chasangwi.details!, finalIncome: chasangwi.income, excludePrivateTransfer: true })}>
                                    계산 내역 보기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            )}
                        </div>
                    )}

                    <div className="benefit-card style-chasangwi-medical">
                        <div className="card-title-decor">
                            <div className="decor-line left"></div>
                            <h3>차상위 본인부담 경감</h3>
                            <div className="decor-line right"></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span className="income-label-box">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                소득인정액
                            </span>
                            <span className="income-amount-box">{chasangwiMedical?.income?.toLocaleString()} <span style={{fontSize:'0.9rem', color:'#64748b', fontWeight:500}}>원</span></span>
                        </div>

                        <div className="benefit-item single-item">
                            <span className="benefit-criteria">선정기준: {thresholdChasangwi.toLocaleString()}원</span>
                            <span className={`status-badge ${chasangwiMedical?.eligible ? 'possible' : 'impossible'}`}>
                                {chasangwiMedical?.eligible ? '가능' : '불가능'}
                            </span>
                        </div>

                        {chasangwiMedical?.details && (
                            <button className="details-btn-styled" onClick={() => setModalConfig({ title: '차상위 본인부담경감 상세내역', details: chasangwiMedical.details!, finalIncome: chasangwiMedical.income, excludePrivateTransfer: true })}>
                                계산 내역 보기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        )}
                    </div>
                        </>
                    )}
                    {formData.isSingleParent && (
                        <div className="benefit-card style-hanbumo">
                            <div className="card-title-decor">
                                <div className="decor-line left"></div>
                                <h3>한부모가족지원</h3>
                                <div className="decor-line right"></div>
                            </div>

                            <div className="income-summary-box">
                                <span className="income-label-box">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    소득인정액
                                </span>
                                <span className="income-amount-box">{hanbumo?.income?.toLocaleString()} <span style={{fontSize:'0.9rem', color:'#64748b', fontWeight:500}}>원</span></span>
                            </div>

                            <div className="benefit-item single-item">
                                <span className="benefit-criteria">선정기준: {hanbumo?.threshold ? hanbumo.threshold.toLocaleString() : Math.floor(medianIncome * 0.63).toLocaleString()}원</span>
                                <span className={`status-badge ${hanbumo?.eligible ? 'possible' : 'impossible'}`}>
                                    {hanbumo?.eligible ? '가능' : '불가능'}
                                </span>
                            </div>

                            {hanbumo?.details && (
                                <button className="details-btn-styled" onClick={() => setModalConfig({ title: '한부모가족지원 상세 내역', details: hanbumo.details!, finalIncome: hanbumo.income })}>
                                    계산 내역 보기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="result-page-actions" style={{ marginTop: '30px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className="edit-btn" onClick={() => setShowStepModal(true)} style={{ padding: '10px 30px' }}>입력 내용 수정하기</button>
                <button className="reset-btn" onClick={onReset} style={{ padding: '10px 30px' }}>처음부터 다시하기</button>
            </div>

            {modalConfig && (
                <CalculationDetailsModal 
                    title={modalConfig.title}
                    formData={formData} 
                    details={modalConfig.details} 
                    finalIncome={modalConfig.finalIncome}
                    medicalDetails={modalConfig.medicalDetails}
                    medicalIncome={modalConfig.medicalIncome}
                    excludePrivateTransfer={modalConfig.excludePrivateTransfer}
                    onClose={() => setModalConfig(null)} 
                />
            )}

            {showRentModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', width: '90%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.4rem' }}>🏠</span> 월세 금액 입력
                        </h3>
                        {formData.region === 'metro' && (
                            <div style={{ marginBottom: '20px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '10px', fontWeight: '600' }}>인천에 거주하십니까?</p>
                                <div style={{ display: 'flex', gap: '16px' }} className="radio-group-box">
                                    <label className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                        <input type="radio" checked={isIncheon} onChange={() => setIsIncheon(true)} style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} /> <span style={{fontSize: '0.95rem'}}>예</span>
                                    </label>
                                    <label className="radio-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                                        <input type="radio" checked={!isIncheon} onChange={() => setIsIncheon(false)} style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} /> <span style={{fontSize: '0.95rem'}}>아니오</span>
                                    </label>
                                </div>
                            </div>
                        )}
                        
                        <div style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '16px', borderRadius: '10px', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.6', border: '1px solid #bfdbfe', display: 'flex', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>💡</span>
                            <div>
                                <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>주거급여 계산을 위해 월세 금액을 입력해주세요.</p>
                                <p style={{ margin: '0', opacity: 0.85, fontSize: '0.85rem' }}>LH공사 전세 임대의 경우, <strong>지원금에 대한 이자(임대료)</strong>를 입력해 주세요.</p>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '28px' }}>
                            <div className="input-wrapper" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px', border: '1px solid #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', backgroundColor: '#fff' }}>
                                <input 
                                    type="text" 
                                    inputMode="numeric" 
                                    value={userRentStr} 
                                    onChange={(e) => setUserRentStr(e.target.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ','))} 
                                    placeholder="0" 
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                    style={{ flex: 1, fontSize: '1.2rem', fontWeight: 'bold', padding: '16px 20px', color: '#0f172a', border: 'none', outline: 'none' }}
                                />
                                <button type="button" className="unit-toggle" onClick={() => setRentInputUnit(prev => prev === 'manwon' ? 'won' : 'manwon')} style={{ padding: '8px 14px', margin: '0 12px 0 0', borderRadius: '8px', backgroundColor: rentInputUnit === 'manwon' ? '#dbeafe' : '#f1f5f9', color: rentInputUnit === 'manwon' ? '#2563eb' : '#64748b', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}>
                                    {rentInputUnit === 'manwon' ? '만원' : '원'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowRentModal(false)} style={{ padding: '10px 20px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s' }}>취소</button>
                            <button onClick={handleCalculateHousingBenefit} style={{ padding: '10px 24px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}>확인</button>
                        </div>
                    </div>
                </div>
            )}
            {showStepModal && (
                <div className="modal-overlay" onClick={() => setShowStepModal(false)} style={{ zIndex: 1000 }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#0f4c81', fontSize: '1.2rem', fontWeight: 'bold' }}>수정할 단계를 선택하세요</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => onNavigate(1)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor='#f8fafc'}>1단계: 기본 정보</button>
                            <button onClick={() => onNavigate(2)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor='#f8fafc'}>2단계: 소득 정보</button>
                            <button onClick={() => onNavigate(3)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor='#f8fafc'}>3단계: 자동차</button>
                            <button onClick={() => onNavigate(4)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#334155', cursor: 'pointer', fontWeight: '500', fontSize: '1rem', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor='#f8fafc'}>4단계: 재산/부채</button>
                        </div>
                        <button onClick={() => setShowStepModal(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
}
