import { useEffect, useRef } from 'react';
import CalculationIcon from './CalculationIcon';
import type { CalculationIconName } from './CalculationIcon';
import './StepSelectionModal.css';

const steps: { number: number; title: string; description: string; icon: CalculationIconName }[] = [
    { number: 1, title: '기본 정보', description: '가구원 수 · 한부모가족 · 재산특례', icon: 'people' },
    { number: 2, title: '소득 정보', description: '근로·사업소득 · 이전소득 · 이자소득', icon: 'income' },
    { number: 3, title: '자동차', description: '차량 정보 · 자동차가액', icon: 'car' },
    { number: 4, title: '재산 / 부채', description: '거주지역 · 재산 · 부채', icon: 'property' },
];

export default function StepSelectionModal({ onClose, onSelect }: { onClose: () => void; onSelect: (step: number) => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
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
    }, []);

    return <dialog ref={dialogRef} className="modal-content step-selection-dialog" aria-labelledby="step-selection-title" aria-describedby="step-selection-description" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
        if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
        }
    }}>
        <header className="step-selection-header">
            <div className="step-selection-eyebrow"><CalculationIcon name="document" /> 입력 내용 수정</div>
            <button type="button" className="step-selection-close" aria-label="수정 단계 선택 닫기" onClick={onClose}>×</button>
            <h2 id="step-selection-title">어떤 정보를 수정할까요?</h2>
            <p id="step-selection-description">수정할 단계를 선택하면 해당 화면으로 이동합니다.</p>
        </header>
        <div className="step-selection-options">
            {steps.map(step => <button type="button" className="step-selection-option" key={step.number} onClick={() => onSelect(step.number)}>
                <span className="step-selection-icon"><CalculationIcon name={step.icon} /></span>
                <span className="step-selection-copy"><span className="step-selection-label"><span>{step.number}단계</span><strong>{step.title}</strong></span><span className="step-selection-description">{step.description}</span></span>
                <svg className="step-selection-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
            </button>)}
        </div>
        <footer className="step-selection-footer"><button type="button" onClick={onClose}>취소</button></footer>
    </dialog>;
}
