import { useEffect, useRef, useState } from 'react';
import type { Unit } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';
import CalculationIcon from './CalculationIcon';
import './InterestIncomeInputModal.css';

interface Props {
    amount: string;
    unit: Unit;
    months: string;
    onClose: () => void;
    onSave: (values: { amount: string; unit: Unit; months: string }) => void;
}

export default function InterestIncomeInputModal({ amount, unit, months, onClose, onSave }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [draftAmount, setDraftAmount] = useState(amount);
    const [draftUnit, setDraftUnit] = useState<Unit>(unit);
    const [draftMonths, setDraftMonths] = useState(months);
    const [error, setError] = useState<{ field: 'amount' | 'months'; text: string } | null>(null);

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

    const save = () => {
        if (!draftAmount && !draftMonths) return onSave({ amount: '', unit: draftUnit, months: '' });
        if (!draftAmount || !Number.isFinite(Number(draftAmount))) {
            setError({ field: 'amount', text: '받은 이자소득 금액을 입력해 주세요.' });
            dialogRef.current?.querySelector<HTMLInputElement>('#propertyInterestIncome')?.focus();
            return;
        }
        if (!Number.isSafeInteger(Number(draftMonths)) || Number(draftMonths) < 1) {
            setError({ field: 'months', text: '가입기간을 1개월 이상의 정수로 입력해 주세요.' });
            dialogRef.current?.querySelector<HTMLInputElement>('#propertyInterestMonths')?.focus();
            return;
        }
        onSave({ amount: draftAmount, unit: draftUnit, months: draftMonths });
    };

    return <dialog ref={dialogRef} className="modal-content interest-input-dialog" aria-labelledby="interest-input-title" aria-describedby="interest-input-description" onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) { event.preventDefault(); save(); }
    }}>
        <header className="interest-input-header">
            <div className="interest-input-heading"><span className="interest-input-icon"><CalculationIcon name="interest" /></span><span>재산소득 입력</span><button type="button" className="interest-input-close" aria-label="이자소득 입력 닫기" onClick={onClose}>×</button></div>
            <h2 id="interest-input-title">이자소득과 가입기간을 입력해 주세요</h2>
            <p id="interest-input-description">2026년에 받은 이자소득 총액과 해당 상품의 가입기간을 입력합니다.</p>
        </header>
        <div className="interest-input-body">
            <div className="form-group">
                <label htmlFor="propertyInterestIncome">받은 이자소득 총액</label>
                <div className="input-wrapper">
                    <input id="propertyInterestIncome" type="text" inputMode="numeric" value={formatNumberWithCommas(draftAmount)} onChange={event => { setDraftAmount(parseFormattedNumber(event.target.value)); setError(null); }} aria-invalid={error?.field === 'amount'} aria-describedby={error?.field === 'amount' ? 'interest-input-error' : undefined} autoFocus />
                    <button type="button" className="unit-toggle" aria-label="이자소득 금액 단위 변경" onClick={() => setDraftUnit(previous => previous === 'manwon' ? 'won' : 'manwon')}>{draftUnit === 'manwon' ? '만원' : '원'}</button>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="propertyInterestMonths">가입기간</label>
                <div className="input-wrapper">
                    <input id="propertyInterestMonths" type="number" inputMode="numeric" min="1" step="1" value={draftMonths} onChange={event => { setDraftMonths(event.target.value); setError(null); }} aria-invalid={error?.field === 'months'} aria-describedby={error?.field === 'months' ? 'interest-input-error' : 'interest-months-hint'} />
                    <span className="interest-months-unit">개월</span>
                </div>
                <p id="interest-months-hint" className="interest-input-hint">예: 1년 가입한 상품은 12개월로 입력해 주세요.</p>
            </div>
            {error && <p id="interest-input-error" className="interest-input-error" role="alert">{error.text}</p>}
            <button type="button" className="interest-input-reset" onClick={() => { setDraftAmount(''); setDraftMonths(''); setError(null); }}>입력 초기화</button>
        </div>
        <footer className="interest-input-footer"><button type="button" className="interest-input-cancel" onClick={onClose}>취소</button><button type="button" className="interest-input-save" onClick={save}>입력 완료</button></footer>
    </dialog>;
}
