import { useEffect, useRef, useState } from 'react';
import CalculationIcon from './CalculationIcon';
import './EarnedIncomeModal.css';

interface Props {
    isOpen: boolean;
    householdSize: number;
    onClose: () => void;
    onSubmit: (members: { ageGroup: string }[]) => void;
}

const ageOptions = [
    { value: '34_or_less', label: '34세 이하' },
    { value: '35_to_64', label: '35세 - 64세' },
    { value: '65_or_more', label: '65세 이상' },
];

function SelectionMark({ selected }: { selected: boolean }) {
    return <span className={`earned-selection-mark${selected ? ' is-selected' : ''}`} aria-hidden="true">{selected && <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m3 8 3 3 7-7" /></svg>}</span>;
}

export default function EarnedIncomeModal({ isOpen, householdSize, onClose, onSubmit }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [memberCount, setMemberCount] = useState(1);
    const [ages, setAges] = useState<string[]>([]);
    const [step, setStep] = useState(1);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            dialog?.close();
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus({ preventScroll: true });
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCountSubmit = () => {
        if (memberCount === 0) return onSubmit([]);
        setAges(Array(memberCount).fill(''));
        setAlertMessage(null);
        setStep(2);
    };
    const handleAgeSubmit = () => {
        if (ages.some(age => age === '')) {
            setAlertMessage('소득이 있는 가구원의 나이를 모두 선택해 주세요.');
            return;
        }
        onSubmit(ages.map(ageGroup => ({ ageGroup })));
    };

    return <dialog ref={dialogRef} className="modal-content earned-income-dialog" aria-labelledby="earned-income-title" aria-describedby="earned-income-description" onCancel={event => { event.preventDefault(); onClose(); }}>
        <header className="earned-income-header">
            <div className="earned-income-heading-row">
                <span className="earned-income-heading-icon"><CalculationIcon name="income" /></span>
                <span className="earned-income-eyebrow">소득 정보 입력 준비</span>
                <button type="button" className="earned-income-close" onClick={onClose} aria-label="가구원 확인 닫기">×</button>
            </div>
            <h2 id="earned-income-title">{step === 1 ? '소득이 있는 가구원은 몇 명인가요?' : '가구원의 나이를 선택해 주세요'}</h2>
            <p id="earned-income-description">{step === 1 ? '근로소득 또는 사업소득이 있는 가구원 수를 선택해 주세요.' : '선택한 나이에 맞는 소득공제 기준을 적용합니다.'}</p>
            <ol className="earned-income-progress" aria-label="가구원 확인 진행 단계">
                <li className={step === 1 ? 'is-current' : 'is-complete'} aria-current={step === 1 ? 'step' : undefined}><span>1</span>가구원 수</li>
                <li className={step === 2 ? 'is-current' : ''} aria-current={step === 2 ? 'step' : undefined}><span>2</span>나이 선택</li>
            </ol>
        </header>
        <div className="earned-income-body">
            {step === 1 ? <>
                <div className="earned-income-field-heading"><h3>소득이 있는 가구원 수</h3><span>전체 {householdSize}인 가구</span></div>
                <div className="earned-count-options" role="group" aria-label="소득이 있는 가구원 수">
                    {Array.from({ length: householdSize + 1 }, (_, i) => <button type="button" className="earned-count-option" aria-pressed={memberCount === i} onClick={() => setMemberCount(i)} key={i}>
                        <SelectionMark selected={memberCount === i} />
                        <span>{i === 0 ? '없음' : `${i}명`}</span>
                    </button>)}
                </div>
                <p className="earned-income-hint"><CalculationIcon name="people" />{memberCount === 0 ? '근로·사업소득 없이 소득 정보 입력으로 이동합니다.' : `선택한 ${memberCount}명의 나이를 다음 화면에서 확인합니다.`}</p>
            </> : <>
                <div className="earned-income-field-heading"><h3>소득이 있는 가구원 {memberCount}명</h3><span>{ages.filter(Boolean).length} / {memberCount}명 선택</span></div>
                <div className="earned-age-members">
                    {ages.map((age, index) => <fieldset className={`earned-age-member${alertMessage && !age ? ' needs-selection' : ''}`} key={index}>
                        <legend><span>{index + 1}</span>가구원 {index + 1}</legend>
                        <div className="earned-age-options">
                            {ageOptions.map(option => <button type="button" className="earned-age-option" aria-pressed={age === option.value} onClick={() => {
                                setAges(previous => previous.map((value, i) => i === index ? option.value : value));
                                setAlertMessage(null);
                            }} key={option.value}>{option.label}</button>)}
                        </div>
                    </fieldset>)}
                </div>
                {alertMessage && <p className="earned-income-error" role="alert">{alertMessage}</p>}
            </>}
        </div>
        <footer className="earned-income-footer">
            <button type="button" className="earned-income-secondary" onClick={step === 1 ? onClose : () => { setStep(1); setAlertMessage(null); }}>{step === 1 ? '취소' : '이전'}</button>
            <button type="button" className="earned-income-primary" onClick={step === 1 ? handleCountSubmit : handleAgeSubmit}>{step === 1 ? '다음' : '완료'}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg></button>
        </footer>
    </dialog>;
}
