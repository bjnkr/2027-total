import { useEffect, useRef, useState } from 'react';
import type { Unit } from '../types';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils';
import CalculationIcon from './CalculationIcon';
import './InterestIncomeInputModal.css';
import './PrivateTransferInputModal.css';

interface Props {
    amounts: string[];
    units: Unit[];
    frequent: boolean;
    onClose: () => void;
    onSave: (values: { amounts: string[]; units: Unit[]; frequent: boolean }) => void;
}

export default function PrivateTransferInputModal({ amounts, units, frequent, onClose, onSave }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [draftAmounts, setDraftAmounts] = useState(() => Array.from({ length: 12 }, (_, i) => amounts[i] ?? ''));
    const [draftUnits, setDraftUnits] = useState<Unit[]>(() => Array.from({ length: 12 }, (_, i) => units[i] ?? 'manwon'));
    const [draftFrequent, setDraftFrequent] = useState(frequent);
    const receivedMonths = draftAmounts.filter(value => Number(value) > 0).length;
    const isFrequent = draftFrequent || receivedMonths >= 6;
    const total = draftAmounts.reduce((sum, value, i) => sum + Number(value || '0') * (draftUnits[i] === 'manwon' ? 10000 : 1), 0);

    useEffect(() => {
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
    }, []);

    return <dialog ref={dialogRef} className="modal-content interest-input-dialog private-transfer-input-dialog" aria-labelledby="private-transfer-input-title" aria-describedby="private-transfer-input-description" onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            const inputs = Array.from(dialogRef.current?.querySelectorAll<HTMLInputElement>('.private-transfer-month-grid input') ?? []);
            const index = inputs.indexOf(event.target);
            if (index >= 0 && index < inputs.length - 1) inputs[index + 1].focus();
        }
    }}>
        <header className="interest-input-header">
            <div className="interest-input-heading"><span className="interest-input-icon"><CalculationIcon name="gift" /></span><span>사적이전소득 입력</span><button type="button" className="interest-input-close" aria-label="월별 지원금액 입력 닫기" onClick={onClose}>×</button></div>
            <h2 id="private-transfer-input-title">월별로 받은 지원금액을 입력해 주세요</h2>
            <p id="private-transfer-input-description">입력하지 않은 월은 0원으로 계산합니다.</p>
        </header>
        <div className="interest-input-body private-transfer-input-body">
            <div className="private-transfer-frequency">
                <label className="private-transfer-frequency-choice" htmlFor="isFrequentPrivateTransfer"><input id="isFrequentPrivateTransfer" type="checkbox" checked={isFrequent} disabled={receivedMonths >= 6} onChange={event => setDraftFrequent(event.target.checked)} /><span>6회 이상 지원받음 (정기 지원)</span></label>
                <p>{receivedMonths >= 6 ? '금액을 입력한 월이 6개월 이상이므로 정기 지원으로 계산합니다.' : '최근 1년간 실제 입금받은 총 횟수가 6회 이상이면 선택해 주세요. 같은 달에 여러 번 받은 경우도 포함합니다.'}</p>
            </div>
            <div className="private-transfer-month-heading"><strong>월별 지원 금액</strong><span>금액 단위를 눌러 원·만원 변경</span></div>
            <div className="private-transfer-month-grid">
                {draftAmounts.map((value, index) => <div className="form-group" key={index}>
                    <label htmlFor={`privateTransferMonth-${index + 1}`}>{index + 1}월</label>
                    <div className="input-wrapper"><input id={`privateTransferMonth-${index + 1}`} type="text" inputMode="numeric" value={formatNumberWithCommas(value)} onChange={event => setDraftAmounts(previous => previous.map((amount, i) => i === index ? parseFormattedNumber(event.target.value) : amount))} /><button type="button" className="unit-toggle" aria-label={`${index + 1}월 지원금액 단위 변경`} onClick={() => setDraftUnits(previous => previous.map((unit, i) => i === index ? unit === 'manwon' ? 'won' : 'manwon' : unit))}>{draftUnits[index] === 'manwon' ? '만원' : '원'}</button></div>
                </div>)}
            </div>
            <div className="private-transfer-draft-total"><span>입력한 {receivedMonths}개월 합계</span><strong>{total.toLocaleString('ko-KR')}원</strong></div>
            <button type="button" className="interest-input-reset" onClick={() => { setDraftAmounts(Array(12).fill('')); setDraftFrequent(false); }}>입력 초기화</button>
        </div>
        <footer className="interest-input-footer"><button type="button" className="interest-input-cancel" onClick={onClose}>취소</button><button type="button" className="interest-input-save" onClick={() => onSave({ amounts: draftAmounts, units: draftUnits, frequent: isFrequent })}>입력 완료</button></footer>
    </dialog>;
}
