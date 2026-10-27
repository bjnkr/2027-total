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
import { normalizeFormState } from './normalizeFormState';
import './index.css';

function StepIndicator({ currentStep }: { currentStep: number }) {
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
}

export default function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [helpPanelState, setHelpPanelState] = useState<{isOpen: boolean, topic: string | null}>({ isOpen: false, topic: null });
    const defaultHelpTopic = ['basic_info', 'basic_info', 'earned_income', 'automobile_business', 'property_debt'][currentStep] ?? 'basic_info';
    const [formData, setFormData] = useState<UnifiedFormState>(initialFormState);
    const navigateToStep = (step: React.SetStateAction<number>) => {
        setCurrentStep(step);
        setHelpPanelState({ isOpen: false, topic: null });
    };
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [loading, setLoading] = useState(true);


    const [helpRequestId, setHelpRequestId] = useState(0);

    const openHelpPanel = (topic: string) => {
        setHelpRequestId(id => id + 1);
        setHelpPanelState({ isOpen: true, topic });
    };

    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
    const [isCarWarningOpen, setIsCarWarningOpen] = useState(false);
    const [isSingleParentCarWarningOpen, setIsSingleParentCarWarningOpen] = useState(false);
    const [isSingleParentOnlyMode, setIsSingleParentOnlyMode] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        // [API] 컴포넌트 마운트 시 이력 로드 (절대 경로 지정)
        fetch(`${import.meta.env.BASE_URL}api/get_history.php`)
            .then(res => res.json())
            .then(data => {
                if (data && data.success && data.input_data) {
                    setFormData(normalizeFormState(data.input_data));
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
                navigateToStep(prev => prev + 1);
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

        navigateToStep(prev => prev + 1);
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
        navigateToStep(2);
    };

    const handlePrev = () => {
        const now = Date.now();
        if (now - lastActionTime.current < 400) return;
        lastActionTime.current = now;
        navigateToStep(prev => prev - 1);
    };

    const handleCalculate = async (e?: React.MouseEvent | React.FormEvent) => {
        if (e) e.preventDefault();
        const now = Date.now();
        if (now - lastActionTime.current < 400) return;
        lastActionTime.current = now;

        try {
            // [API] 통합 계산 및 이력 저장 API 호출 (절대 경로 지정)
            const response = await fetch(`${import.meta.env.BASE_URL}api/calculate.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const text = await response.text();
            let data: CalculationResults;
            try {
                data = JSON.parse(text);
            } catch {
                console.error('JSON Parse Error. Raw response:', text);
                setAlertMessage(`서버 응답 오류 (JSON 파싱 실패):\n${text.substring(0, 100)}...`);
                return;
            }

            if (data.success) {
                setResults(data);
                navigateToStep(5);
            } else {
                setAlertMessage(data.error || '계산 중 오류가 발생했습니다.');
            }
        } catch (err: unknown) {
            console.error('Calculation error:', err);
            alert(`서버와 통신 중 오류가 발생했습니다.\n상세: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    if (loading) return <div>로딩 중...</div>;

    return (
        <div className="calculator-layout">
            <div className="container-wrapper">
            <div className="container">
            <div className="top-header">
                <a className="brand-logo" href="https://bjn.kr" target="_self" aria-label="복지N 홈으로 이동">
                    <img src="https://bjn.kr/img_bjn/logo2.png" className="logo-icon" alt="복지N 로고" style={{height: '40px', borderRadius: '6px'}} />
                </a>
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
                <StepIndicator currentStep={currentStep} />

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
                        navigateToStep(1);
                        setResults(null);
                    }} 
                    onNavigate={(step: number) => navigateToStep(step)}
                />
            )} 

            {isIncomeModalOpen && <EarnedIncomeModal
                isOpen={isIncomeModalOpen} 
                householdSize={parseInt(formData.householdSize, 10)}
                onClose={() => setIsIncomeModalOpen(false)} 
                onSubmit={handleIncomeModalSubmit} 
            />}
            {isCarWarningOpen && (
                <CarWarningModal onClose={() => setIsCarWarningOpen(false)} />
            )}
            {isSingleParentCarWarningOpen && (
                <SingleParentCarWarningModal 
                    onClose={() => setIsSingleParentCarWarningOpen(false)} 
                    onProceed={() => {
                        setIsSingleParentCarWarningOpen(false);
                        setIsSingleParentOnlyMode(true);
                        navigateToStep(4);
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
