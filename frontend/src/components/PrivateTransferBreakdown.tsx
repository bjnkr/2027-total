import type { CalculationDetails, UnifiedFormState } from '../types';

interface Props {
    formData: UnifiedFormState;
    details: CalculationDetails;
    excluded?: boolean;
}

const money = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
const tableMoney = (value: number) => <>{Math.round(value).toLocaleString('ko-KR')}<span className="private-table-unit">원</span></>;

export default function PrivateTransferBreakdown({ formData, details, excluded = false }: Props) {
    const rows = details.privateTransferMonthlyDetails ?? [];
    const totals = rows.reduce((sum, row) => ({
        input: sum.input + row.input,
        deduction: sum.deduction + row.deduction,
        evaluated: sum.evaluated + row.evaluated,
    }), { input: 0, deduction: 0, evaluated: 0 });
    const same = formData.privateTransferType === 'same';
    const threshold = details.privateTransferAnnualThreshold ?? 0;
    const mode = same ? '매월 같은 금액 지원' : threshold > 0 ? '비정기지원' : '정기지원';
    const result = details.evaluatedPrivateTransferIncome;
    const deduction = details.privateTransferDeductionPerMonth ?? 0;

    return <div className="private-breakdown">

        <div className="private-result-card">
            <div className="private-result-total"><strong>월 사적이전소득 평가액</strong><span>{money(result)}</span></div>
            {excluded ? <p className="private-excluded">이 제도에서는 사적이전소득을 소득에 반영하지 않습니다.</p> : rows.length === 0 ? <p className="private-excluded">다시 계산하면 상세 계산 근거를 확인할 수 있습니다.</p> : <div className="private-result-basis">
                <h5>계산 근거 ({formData.householdSize}인 가구)</h5>
                <p>적용 기준 중위소득 : <strong>{money(details.privateTransferMedianIncome ?? 0)}</strong></p>
                <p>기본 공제액 (15%) : <strong className="private-deduction">{money(deduction)}</strong></p>
                {threshold > 0 && <p>기준 중위소득 50% : <strong className="private-deduction">{money(threshold)}</strong></p>}
                <div className="private-formula">
                    <h6>상세 계산 방식 · {mode}</h6>
                    {same ? <>
                        <p>월 지원금 − 월 기본 공제액</p>
                        <p>= {money(rows[0].input)} − {money(deduction)}</p>
                    </> : threshold > 0 ? <>
                        <p>( 월별 공제 후 금액 합계 − 기준 중위소득 50% ) ÷ 12개월</p>
                        <p>= ( {money(totals.evaluated)} − {money(threshold)} ) ÷ 12</p>
                    </> : <>
                        <p>월별 공제 후 금액 합계 ÷ 12개월</p>
                        <p>= {money(totals.evaluated)} ÷ 12</p>
                    </>}
                    <strong>= {money(result)}</strong>
                    {(same && rows[0].input < deduction || threshold > totals.evaluated) && <p>계산 금액이 음수면 0원으로 반영합니다</p>}
                </div>
            </div>}
        </div>
        {!excluded && !same && rows.length > 0 && <section className="private-monthly-card" aria-label="사적이전소득 월별 상세 내역">
            <h5>월별 상세 내역</h5>
            <div className="private-table-wrap">
                <table className="private-monthly-table">
                    <thead><tr><th scope="col">구분</th><th scope="col">입력 금액</th><th scope="col">공제액</th><th scope="col">계산 소득</th></tr></thead>
                    <tbody>{rows.map((row, index) => <tr key={index}><th scope="row">{index + 1}월</th><td>{tableMoney(row.input)}</td><td className="private-deduction">−{tableMoney(row.deduction)}</td><td>{tableMoney(row.evaluated)}</td></tr>)}</tbody>
                    <tfoot><tr><th scope="row">합계</th><td>{tableMoney(totals.input)}</td><td>{tableMoney(totals.deduction)}</td><td>{tableMoney(totals.evaluated)}</td></tr></tfoot>
                </table>
            </div>
            <p className="private-table-note">공제액은 해당 월의 입력 금액을 초과하지 않습니다. 금액은 원 단위로 반올림해 표시하므로 표시값의 합계와 차이가 날 수 있습니다.</p>
        </section>}
    </div>;
}
