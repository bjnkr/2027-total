import React, { useState, useEffect } from 'react';
import { type UnifiedFormState, initialFormState, type CalculationResults } from './types';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2IncomeInfo from './components/Step2IncomeInfo';
import Step3Automobile from './components/Step3Automobile';
import Step4PropertyDebt from './components/Step4PropertyDebt';
import ResultDashboard from './components/ResultDashboard';
import EarnedIncomeModal from './components/EarnedIncomeModal';
import CarWarningModal from './components/CarWarningModal';
import SingleParentCarWarningModal from './components/SingleParentCarWarningModal';
import { AlertModal } from './components/AlertModal';
import HelpSidePanel from './components/HelpSidePanel';
import { parseFormattedNumber } from './utils';
import './index.css';

export const MEDIAN_INCOME = {
    '1': 2736042,
    '2': 4480645,
    '3': 5718091,
    '4': 6929885,
    '5': 8063019,
    '6': 9129201,
    '7': 10152665,
    '8': 11176129,
    '9': 12199593,
    '10': 13223057
};

export const CHASANGWI_THRESHOLDS = {
    '1': 1368021,
    '2': 2240323,
    '3': 2859046,
    '4': 3464943,
    '5': 4031510,
    '6': 4564601,
    '7': 5076333,
    '8': 5588065,
    '9': 6099797,
    '10': 6611529,
};

export const HANBUMO_THRESHOLDS = {
    // 2027년 기준중위소득 66%
    '1': 1805788,
    '2': 2957226,
    '3': 3773940,
    '4': 4573724,
    '5': 5321593,
    '6': 6025273,
    '7': 6700759,
    '8': 7376245,
    '9': 8051731,
    '10': 8727218,
};

export default function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [helpPanelState, setHelpPanelState] = useState<{isOpen: boolean, topic: string | null}>({ isOpen: false, topic: null });
    const defaultHelpTopic = ['basic_info', 'basic_info', 'earned_income', 'automobile_business', 'property_debt'][currentStep] ?? 'basic_info';
    const [formData, setFormData] = useState<UnifiedFormState>(initialFormState);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [loading, setLoading] = useState(true);


    const [helpRequestId, setHelpRequestId] = useState(0);

    const openHelpPanel = (topic: string) => {
        setHelpRequestId(id => id + 1);
        setHelpPanelState({ isOpen: true, topic });
    };

    useEffect(() => {
        setHelpPanelState({ isOpen: false, topic: null });
    }, [currentStep]);
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isCarWarningOpen, setIsCarWarningOpen] = useState(false);
    const [isSingleParentCarWarningOpen, setIsSingleParentCarWarningOpen] = useState(false);
    const [isSingleParentOnlyMode, setIsSingleParentOnlyMode] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        // [API] 컴포넌트 마운트 시 이력 로드 (절대 경로 지정)
        fetch('/calc/2027/api/get_history.php')
            .then(res => res.json())
            .then(data => {
                if (data && data.success && data.input_data) {
                    // JSON 이력에 저장된 boolean이 문자열("false")로 들어와도
                    // JavaScript의 truthy 값으로 잘못 해석되지 않도록 정규화한다.
                    const savedData = data.input_data;
                    setFormData({
                        ...initialFormState,
                        ...savedData,
                        isMultiChildHousehold: savedData.isMultiChildHousehold === true || savedData.isMultiChildHousehold === 'true',
                    });
                }
            })
            .catch(err => console.error('Failed to load history:', err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    const lastActionTime = React.useRef(0);

    const handleNext = () => {
        const now = Date.now();
        if (now - lastActionTime.current < 400) return;
        lastActionTime.current = now;

        if (currentStep === 1) {
            setIsIncomeModalOpen(true);
            return;
        }

        if (currentStep === 3) {
            const { automobileDisplacement, automobileRegistrationDate, automobileProperty, automobileDisabilityType, inputUnits } = formData;
            
            const hasDisplacement = !!automobileDisplacement;
            const hasRegistrationDate = !!automobileRegistrationDate;
            const hasProperty = !!automobileProperty;

            if (!hasDisplacement && !hasRegistrationDate && !hasProperty) {
                // No car entered
                setCurrentStep(prev => prev + 1);
                return;
            }

            if (!hasDisplacement || !hasRegistrationDate || !hasProperty) {
                setAlertMessage("자동차 정보를 모두 입력해 주세요.");
                return;
            }

            if (automobileRegistrationDate.length !== 4) {
                setAlertMessage("년도를 정확하게 입력해 주세요");
                return;
            }

            const displacement = parseInt(parseFormattedNumber(automobileDisplacement)) || 0;
            const regYearStr = automobileRegistrationDate;
            const regYear = parseInt(regYearStr) || 0;
            const seats = parseInt(parseFormattedNumber(formData.automobileSeats)) || 0;
            
            const rawPrice = parseFloat(parseFormattedNumber(automobileProperty)) || 0;
            const multiplier = inputUnits.automobileProperty === 'manwon' ? 10000 : 1;
            const price = rawPrice * multiplier;

            const requiresSeatsForMultiChild = automobileDisabilityType !== 'severe' && formData.isMultiChildHousehold && displacement >= 2000 && displacement < 2500;

            if (requiresSeatsForMultiChild && !formData.automobileSeats) {
                setAlertMessage("다자녀 가구 자동차 기준 확인을 위해 승차정원을 입력해 주세요.");
                return;
            }

            const vehicleAge = Math.max(0, 2027 - regYear);

            let isFullConversionVehicle = false;
            let isSingleParentException = false;

            if (price > 0) {
                if (automobileDisabilityType === 'severe') {
                    isFullConversionVehicle = displacement >= 2500;
                } else if (automobileDisabilityType === 'mild' && (!formData.isMultiChildHousehold || displacement < 2000)) {
                    isFullConversionVehicle = displacement >= 2000;
                } else {
                    const meetsMultiChildDisplacementAndSeats = displacement < 2000 || (displacement < 2500 && seats >= 7);
                    const meetsMultiChildBase = formData.isMultiChildHousehold && meetsMultiChildDisplacementAndSeats;
                    const meetsMultiChildAdditional = vehicleAge >= 10 || price < 5000000;

                    if (meetsMultiChildBase && meetsMultiChildAdditional) {
                        isFullConversionVehicle = false;
                    } else {
                        // 2027년 기준: 2017년 등록 차량은 차령 10년 이상으로 본다.
                        // 다자녀 여부와 관계없이 차령 10년 이상이면 일반 차량 경고 대상에서 제외한다.
                        const meetsTenYearAgeException = vehicleAge >= 10;
                        const baseCondition = !meetsTenYearAgeException && (displacement >= 2000 || (displacement < 2000 && regYear >= 2017 && price >= 5000000));
                        if (baseCondition) {
                            if (formData.isSingleParent && displacement < 2000 && regYear >= 2017 && price >= 5000000 && price < 10000000) {
                                isSingleParentException = true;
                            } else {
                                isFullConversionVehicle = true;
                            }
                        }
                    }
                }
            }

            if (isSingleParentException) {
                setIsSingleParentCarWarningOpen(true);
                return;
            }

            if (isFullConversionVehicle) {
                setIsCarWarningOpen(true);
                return;
            }
        }

        setCurrentStep(prev => prev + 1);
    };

    const handleIncomeModalSubmit = (members: { ageGroup: string }[]) => {
        setIsIncomeModalOpen(false);
        const mapAgeToType = (ageGroup: string) => {
            if (ageGroup === '34_or_less') return 'youth';
            if (ageGroup === '65_or_more') return 'senior';
            return 'general';
        };

        const newEarnedIncomes = members.map((member, index) => ({
            id: Date.now() + index,
            label: `가구원 ${index + 1}`,
            ageGroup: member.ageGroup,
            amount: '',
            pension: '',
            type: mapAgeToType(member.ageGroup),
            amountUnit: 'manwon' as const,
            pensionUnit: 'manwon' as const
        }));

        setFormData(prev => ({
            ...prev,
            earnedIncomes: newEarnedIncomes
        }));
        setCurrentStep(2);
    };

    const handlePrev = () => {
        const now = Date.now();
        if (now - lastActionTime.current < 400) return;
        lastActionTime.current = now;
        setCurrentStep(prev => prev - 1);
    };

    const handleCalculate = async (e?: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();
        const now = Date.now();
        if (now - lastActionTime.current < 400) return;
        lastActionTime.current = now;

        try {
            // [API] 통합 계산 및 이력 저장 API 호출 (절대 경로 지정)
            const response = await fetch('/calc/2027/api/calculate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const text = await response.text();
            let data: CalculationResults;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('JSON Parse Error. Raw response:', text);
                setAlertMessage(`서버 응답 오류 (JSON 파싱 실패):\n${text.substring(0, 100)}...`);
                return;
            }

            if (data.success) {
                setResults(data);
                setCurrentStep(5);
            } else {
                setAlertMessage(data.error || '계산 중 오류가 발생했습니다.');
            }
        } catch (err: any) {
            console.error('Calculation error:', err);
            alert(`서버와 통신 중 오류가 발생했습니다.\n상세: ${err.message}`);
        }
    };

    if (loading) return <div>로딩 중...</div>;

    const StepIndicator = () => {
        const steps = [
            { id: 1, label: '기본 정보' },
            { id: 2, label: '소득 정보' },
            { id: 3, label: '자동차' },
            { id: 4, label: '재산/부채' }
        ];

        return (
            <div className="step-indicator-wrapper">
                <div className="step-progress-track">
                    <div 
                        className="step-progress-fill" 
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>
                </div>
                <div className="step-items-container">
                    {steps.map(step => {
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        
                        return (
                            <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {isCompleted ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <div className="step-label">{step.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="calculator-layout">
            <div className="container-wrapper">
            <div className="container">
            <div className="top-header">
                <div className="brand-logo">
                    <img src="https://bjn.kr/img_bjn/logo2.png" className="logo-icon" alt="복지N 로고" style={{height: '40px', borderRadius: '6px'}} />
                </div>
                <nav className="top-menu" aria-label="기준표 메뉴">
                    <button type="button" onClick={() => openHelpPanel('major_criteria')}>주요기준</button>
                </nav>
            </div>
            
            <div className="header-separator"></div>

            <header>
                <h1>통합 복지 모의계산기</h1>
                <p>2027년 기준 ㅣ 국민기초, 한부모, 차상위 동시 계산</p>
            </header>

            {currentStep < 5 && (
            <>
            <form onSubmit={handleCalculate}>
                <StepIndicator />

                {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} setAlertMessage={setAlertMessage} openHelpPanel={openHelpPanel} />}
                {currentStep === 2 && <Step2IncomeInfo formData={formData} setFormData={setFormData} setAlertMessage={setAlertMessage} openHelpPanel={openHelpPanel} />}
                {currentStep === 3 && <Step3Automobile formData={formData} setFormData={setFormData} setAlertMessage={setAlertMessage} openHelpPanel={openHelpPanel} />}
                {currentStep === 4 && <Step4PropertyDebt formData={formData} setFormData={setFormData} setAlertMessage={setAlertMessage} openHelpPanel={openHelpPanel} />}

                <div className={`navigation-buttons ${currentStep === 1 ? 'single-button' : ''}`}>
                    {currentStep > 1 && (
                        <button type="button" className="prev-btn" onClick={handlePrev}>이전</button>
                    )}
                    {currentStep < 4 && (
                         <button type="button" className="next-btn" onClick={handleNext}>다음</button>
                    )}
                    {currentStep === 4 && (
                        <button type="button" className="calculate-btn" onClick={handleCalculate}>통합 계산하기</button>
                    )}
                </div>
            </form>
            </>
            )}

            {currentStep === 5 && results && (
                <ResultDashboard 
                    formData={formData} 
                    results={results} 
                    isSingleParentOnlyMode={isSingleParentOnlyMode}
                    onReset={() => {
                        setFormData(initialFormState);
                        setCurrentStep(1);
                        setResults(null);
                    }} 
                    onNavigate={(step: number) => setCurrentStep(step)} 
                />
            )} 

            <EarnedIncomeModal 
                isOpen={isIncomeModalOpen} 
                householdSize={parseInt(formData.householdSize, 10)}
                onClose={() => setIsIncomeModalOpen(false)} 
                onSubmit={handleIncomeModalSubmit} 
            />
            {isCarWarningOpen && (
                <CarWarningModal onClose={() => setIsCarWarningOpen(false)} />
            )}
            {isSingleParentCarWarningOpen && (
                <SingleParentCarWarningModal 
                    onClose={() => setIsSingleParentCarWarningOpen(false)} 
                    onProceed={() => {
                        setIsSingleParentCarWarningOpen(false);
                        setIsSingleParentOnlyMode(true);
                        setCurrentStep(4);
                    }}
                />
            )}
            {alertMessage && (
                <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
            )}
            </div>
            </div>

            <div className={`panel-wrapper ${helpPanelState.isOpen ? 'is-open' : ''}`}>
                    <div className={`floating-help-panel${currentStep === 2 ? " income-help-panel" : ""}`}>
                        <HelpSidePanel 
                            onClose={() => setHelpPanelState({ isOpen: false, topic: null })} 
                            showResultResources={currentStep === 5}
                            showAllIncome={currentStep === 2}
                            focusedTopic={helpPanelState.topic}
                            focusRequestId={helpRequestId}
                            topic={helpPanelState.topic ?? defaultHelpTopic} 
                        />
                    </div>
            </div>


            
        </div>
    );
}
