import { useEffect, useRef } from 'react';
import CalculationIcon from './CalculationIcon';
import './LivelihoodSupportModal.css';

export default function LivelihoodSupportModal({ onClose }: { onClose: () => void }) {
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

    return <dialog ref={dialogRef} className="modal-content livelihood-support-dialog" aria-labelledby="livelihood-support-title" onCancel={event => { event.preventDefault(); onClose(); }}>
        <header className="livelihood-support-header">
            <div><span>생계급여</span><h2 id="livelihood-support-title"><CalculationIcon name="people" />부양의무자 기준</h2></div>
            <button type="button" className="livelihood-support-close" aria-label="부양의무자 기준 닫기" onClick={onClose}>×</button>
        </header>
        <div className="livelihood-support-body">
            <section className="livelihood-support-criterion" aria-labelledby="livelihood-support-income">
                <h3 id="livelihood-support-income"><CalculationIcon name="income" />소득 기준</h3>
                <p className="livelihood-support-amount">연 소득 <strong>1.3억 원</strong></p>
                <p className="livelihood-support-note">월 소득 1,084만 원</p>
            </section>
            <section className="livelihood-support-criterion" aria-labelledby="livelihood-support-property">
                <h3 id="livelihood-support-property"><CalculationIcon name="property" />재산 기준</h3>
                <p className="livelihood-support-amount">일반재산 <strong>12억 원</strong></p>
                <p className="livelihood-support-note">부채, 금융재산 및 자동차는 반영하지 않으며, 각종 공제는 적용하지 않습니다.</p>
            </section>
        </div>
        <footer className="livelihood-support-footer"><button type="button" onClick={onClose}>확인</button></footer>
    </dialog>;
}
