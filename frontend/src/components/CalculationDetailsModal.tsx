
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { UnifiedFormState, CalculationDetails } from '../types';
import { parseFormattedNumber } from '../utils';
import PrivateTransferBreakdown from './PrivateTransferBreakdown';
import CalculationIcon, { type CalculationIconName } from './CalculationIcon';
import './CalculationDetailsModal.css';

interface Props {
    title: string;
    formData: UnifiedFormState;
    details: CalculationDetails;
    onClose: () => void;
    hideWrapper?: boolean;
    finalIncome?: number;
    medicalDetails?: CalculationDetails;
    medicalIncome?: number;
    excludePrivateTransfer?: boolean;
}
const money = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
const regions: Record<string, string> = { seoul: '서울', gyeonggi: '경기도', metro: '광역시·세종·창원', other: '그 외 지역' };
const housing: Record<string, string> = { jeonse: '전세·월세', wolse: '월세', owned: '자가', own: '자가', free: '무료임차' };
function AmountRow({ label, value, subtract = false }: { label: string; value: number; subtract?: boolean }) {
    return <div className={`calc-amount-row${subtract ? ' is-deduction' : ''}`}><span>{label}</span><strong>{subtract ? '− ' : ''}{money(value)}</strong></div>;
}
function Expand({ title, children, icon = 'calculator', scrollOnOpen = false }: { title: string; children: ReactNode; icon?: CalculationIconName; scrollOnOpen?: boolean }) {
    return <details className="calc-expand" onToggle={event => {
        const panel = event.currentTarget;
        if (scrollOnOpen && panel.open) {
            panel.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
    }}><summary><CalculationIcon name={icon} /><span>{title}</span><svg className="calc-expand-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></summary><div className="calc-expand-body">{children}</div></details>;
}
export default function CalculationDetailsModal({ title, formData, details, onClose, hideWrapper = false, finalIncome, medicalDetails, medicalIncome, excludePrivateTransfer = false }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [showMedical, setShowMedical] = useState(false);
    useEffect(() => {
        if (hideWrapper) return;
        const dialog = dialogRef.current;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog?.showModal();
        document.body.style.overflow = 'hidden';
        return () => { dialog?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
    }, [hideWrapper]);
    const regularTotal = finalIncome ?? Math.round(details.totalIncomeEvaluation + details.totalPropertyConversion);
    const medicalTotal = medicalIncome ?? (medicalDetails ? Math.round(medicalDetails.totalIncomeEvaluation + medicalDetails.totalPropertyConversion) : regularTotal);
    const canSwitchScheme = Boolean(medicalDetails) && Math.round(regularTotal) !== Math.round(medicalTotal);
    const isMedicalView = canSwitchScheme && showMedical;
    const d = isMedicalView && medicalDetails ? medicalDetails : details;
    if (!d) return null;
    const income = d.totalIncomeEvaluation;
    const property = d.totalPropertyConversion;
    const final = isMedicalView ? medicalTotal : regularTotal;
    const input = (key: string) => Number(parseFormattedNumber(String(formData[key as keyof UnifiedFormState] || '0'))) * (formData.inputUnits[key] === 'manwon' ? 10000 : 1);
    const privateMonths = formData.privateTransferTwelveMonths.map((value, index) => Number(parseFormattedNumber(value || '0')) * (formData.privateTransferTwelveMonthUnits[index] === 'won' ? 1 : 10000));
    const privateRaw = formData.privateTransferType === 'same' ? input('privateTransferIncome') : privateMonths.reduce((sum, value) => sum + value, 0) / 12;
    const interestRaw = input('propertyInterestIncome');
    const evaluatedResidentialProperty = d.residentialPropertyRaw * d.residentialPropertyRate;
    const evaluatedTotalProperty = evaluatedResidentialProperty + d.generalPropertyRaw + d.financialPropertyRaw + d.automobilePropertyRaw;
    const debtInput = d.debtRaw;
    const evaluatedNetProperty = Math.max(0, evaluatedTotalProperty - debtInput);
    const months = Number(formData.propertyInterestMonths) || 12;
    const totalBeforeExpense = d.evaluatedEarnedIncome + d.evaluatedPrivateTransferIncome + d.evaluatedPublicTransferIncome + (d.evaluatedRentalIncome ?? 0) + (d.evaluatedInterestIncome ?? 0);
    const incomeRows = [
        { label: '근로·사업소득', raw: d.totalEarnedRaw, result: d.evaluatedEarnedIncome, note: '근로소득·국민연금 공제 적용' },
        { label: '사적이전소득', raw: privateRaw, result: d.evaluatedPrivateTransferIncome, note: excludePrivateTransfer ? '이 제도에서는 소득에 반영하지 않음' : '지원 방식과 횟수에 따라 공제 적용' },
        { label: '공적이전소득', raw: input('publicTransferIncome'), result: d.evaluatedPublicTransferIncome, note: '입력한 월 금액 반영' },
        { label: '임대·연금소득', raw: input('propertyRentalIncome'), result: d.evaluatedRentalIncome ?? 0, note: '입력한 월 금액 반영' },
        { label: '이자소득', raw: interestRaw, result: d.evaluatedInterestIncome ?? 0, note: '총 이자에서 공제 후 월 소득으로 환산', totalInput: true },
    ];
    const incomeIcons: CalculationIconName[] = ['income', 'gift', 'bank', 'home', 'interest'];
    const propertyCards = [
        { id: 'residential', label: '주거용 재산', raw: d.residentialPropertyRaw, target: d.residentialPropertyAfterDeduction, result: d.residentialPropertyConversion, rate: 1.04, basic: d.residentialBasicDedUsed ?? 0, debt: d.residentialDebtUsed ?? 0 },
        { id: 'general', label: '일반 재산', raw: d.totalGeneralProperty ?? (d.generalPropertyRaw + d.automobilePropertyRaw + (d.residentialExcess ?? 0)), target: d.generalPropertyAfterDeduction, result: d.generalPropertyConversion, rate: 4.17, basic: d.generalBasicDedUsed ?? 0, debt: d.generalDebtUsed ?? 0 },
        { id: 'financial', label: '금융 재산', raw: d.financialPropertyRaw, target: d.financialPropertyAfterDeduction, result: d.financialPropertyConversion, rate: (d.financialPropertyRateValue ?? 0.0626) * 100, basic: d.financialBasicDedUsed ?? 0, debt: d.financialDebtUsed ?? 0 },
    ];
    const body = <div className="calc-dashboard">
        <header className="calc-dashboard-header"><div className="calc-report-heading"><span className="calc-report-icon"><CalculationIcon name="report" /></span><div><span className="calc-eyebrow">계산 결과 자세히 보기</span><h2 id="calc-dashboard-title">{title}</h2></div></div>{!hideWrapper && <button type="button" className="calc-close" onClick={onClose} aria-label="상세내역 닫기" autoFocus>닫기 ×</button>}</header>
        <div className="calc-dashboard-body">
            <div className="calc-context"><span><CalculationIcon name="people" />{formData.householdSize}인 가구</span><span><CalculationIcon name="location" />{regions[formData.region] ?? formData.region}</span><span><CalculationIcon name="home" />{housing[formData.housingType] ?? formData.housingType}</span>{formData.isSingleParent && <span><CalculationIcon name="people" />한부모가족</span>}</div>
            {canSwitchScheme && <div className="calc-scheme-switch" role="group" aria-label="급여별 계산 방식"><button type="button" aria-pressed={!isMedicalView} onClick={() => setShowMedical(false)}>생계·주거·교육급여</button><button type="button" aria-pressed={isMedicalView} onClick={() => setShowMedical(true)}>의료급여</button></div>}
            <section className="calc-overview calc-income-overview" aria-label="소득인정액 계산 요약">
                <div className="calc-stat" data-tone="income"><div className="calc-stat-heading"><CalculationIcon name="income" /><span className="calc-stat-label">소득 평가액</span></div><strong>{money(income)}</strong><small>공제 후 월 소득평가액</small></div><span className="calc-operator" aria-hidden="true">＋</span>
                <div className="calc-stat" data-tone="property"><div className="calc-stat-heading"><CalculationIcon name="property" /><span className="calc-stat-label">재산의 환산소득</span></div><strong>{money(property)}</strong><small>기본재산 공제, 부채 차감 후 월 환산액</small></div><span className="calc-operator" aria-hidden="true">＝</span>
                <div className="calc-stat is-total"><div className="calc-stat-heading"><CalculationIcon name="total" /><span className="calc-stat-label">소득인정액</span></div><strong>{money(final)}</strong><small>급여 선정의 기준이 되는 금액입니다</small></div>
            </section>
            <p className="calc-explainer">소득인정액은 <strong>공제 후 소득 + 재산의 월 환산액</strong>입니다. 실제로 받는 급여액과는 다릅니다.</p>
            {isMedicalView && <p className="calc-notice">의료급여의 근로소득 공제 기준을 적용한 계산입니다. 생계·주거·교육급여와 소득인정액이 다를 수 있습니다.</p>}
            <section className="calc-section calc-income-section" aria-labelledby="calc-income-title">
                <div className="calc-income-summary"><div className="calc-stat-heading"><CalculationIcon name="income" /><h3 id="calc-income-title">소득 평가액</h3></div><strong>{money(income)}</strong><small>공제 후 월 소득평가액</small></div>
                <div className="calc-income-table">
                    <div className="calc-income-table-head"><span>소득 항목</span><span>입력 금액</span><span>월 반영액</span></div>
                    {incomeRows.map((row, index) => <div className="calc-income-row" key={row.label}>
                        <div className="calc-income-name"><span className="calc-row-icon"><CalculationIcon name={incomeIcons[index]} /></span><strong>{row.label}</strong></div>
                        <span><small className="calc-mobile-label">입력 금액</small>{row.label === '사적이전소득' && formData.privateTransferType === 'different'
                            ? '상세 계산내역 확인'
                            : money(row.raw)}
                        </span>
                        <strong><small className="calc-mobile-label">월 반영액</small>{money(row.result)}</strong>
                    </div>)}
                </div>
                <div className="calc-income-footer"><AmountRow label="공제 적용 후 소득 합계" value={totalBeforeExpense} /><AmountRow label="지출요인 공제" value={d.expenditureDeductionRaw ?? 0} subtract /><AmountRow label="최종 소득평가액" value={income} /></div>
                <p className="calc-footnote">공제액이 소득보다 크면 소득평가액은 0원으로 반영합니다. 금액은 원 단위로 반올림해 표시합니다.</p>
                <Expand title="근로·사업소득 계산내역" icon="income">
                    {d.incomeDetails.length === 0 ? <p>입력한 근로·사업소득이 없습니다.</p> : d.incomeDetails.map((item, index) => <div className="calc-member" key={index}>
                        <h4>근로·사업소득 ( {index + 1} )</h4>
                        <AmountRow label="세전 소득" value={item.raw} />
                        {item.baseDeduction !== undefined && item.percentageDeduction !== undefined ? <>
                            {(item.baseDeductionLimit ?? 0) > 0 && <AmountRow label={item.baseDeductionLabel ?? '우선 공제'} value={item.baseDeduction} subtract />}
                            <AmountRow label={`${(item.baseDeductionLimit ?? 0) > 0 ? '추가공제' : '소득공제'} (${Math.round((item.percentageRate ?? 0) * 100)}%)`} value={item.percentageDeduction} subtract />
                            {(item.percentageRate ?? 0) > 0 && <p className="calc-footnote">{money(Math.max(0, item.raw - item.baseDeduction))} × {Math.round((item.percentageRate ?? 0) * 100)}% — {(item.baseDeductionLimit ?? 0) > 0 ? `${item.baseDeductionLabel?.match(/\(.*\)/)?.[0] ?? '(선택 유형)'} 공제 후 남은 소득에 적용` : '세전 소득에 적용'}</p>}
                            {(item.baseDeductionLimit ?? 0) > item.raw && <p className="calc-footnote">우선 공제 기준은 {money(item.baseDeductionLimit!)}이며, 세전 소득 범위 내에서 적용했습니다.</p>}
                        </> : <AmountRow label={item.deductionLabel} value={item.deduction} subtract />}
                        <AmountRow label="국민연금 납부액 공제" value={item.pensionDeduction} subtract />
                        <p className="calc-footnote">국민연금 납부액 ({money(item.pensionDeduction / 0.75)}) × 75% = {money(item.pensionDeduction)}</p>
                        <AmountRow label="공제 후 반영 금액" value={Math.max(0, item.raw - item.deduction - item.pensionDeduction)} />
                    </div>)}
                </Expand>
                <Expand title="사적이전소득 계산 내역" icon="gift">
                    {privateRaw > 0
                        ? <PrivateTransferBreakdown formData={formData} details={d} excluded={excludePrivateTransfer} />
                        : <p>입력한 소득이 없습니다.</p>}
                </Expand>
                <Expand title="이자소득 계산내역" icon="interest">
                    {interestRaw > 0 ? <div className="calc-interest-breakdown">
                        <AmountRow label="입력한 총 이자소득" value={interestRaw} />
                        <div className="calc-amount-row"><span>가입기간</span><strong>{months}개월</strong></div>
                        {d.interestDeduction !== undefined && <AmountRow label="이자소득 공제" value={d.interestDeduction} subtract />}
                        <p>공제 적용 후 연간 이자소득을 12개월로 나누어 월 소득으로 반영합니다.</p>
                        <AmountRow label="소득에 반영된 월 이자소득" value={d.evaluatedInterestIncome ?? 0} />
                        {d.interestDeduction !== undefined && <p className="calc-footnote">({money(interestRaw)} − {money(d.interestDeduction)}) ÷ 12 = {money(d.evaluatedInterestIncome ?? 0)}{interestRaw < d.interestDeduction && <><br />공제액이 이자소득보다 크므로 0원으로 반영합니다.</>}</p>}
                    </div> : <p>입력한 소득이 없습니다.</p>}
                </Expand>
            </section>
            <section className="calc-section calc-property-section" aria-labelledby="calc-property-title">
                <div className="calc-property-summary"><div className="calc-stat-heading"><CalculationIcon name="property" /><h3 id="calc-property-title">재산의 환산소득</h3>{formData.hasPropertyException && <span className="calc-property-exception-badge">재산특례 대상</span>}</div><strong>{money(property)}</strong><div className="calc-property-conversion-breakdown" aria-label="재산별 월 환산액 합산 내역">{propertyCards.map((card, index) => <span className="calc-property-conversion-term" key={card.id}>{index > 0 && <span className="calc-property-conversion-plus" aria-hidden="true">+</span>}<span><strong>{money(card.result)}</strong> ({card.label.replaceAll(' ', '')})</span></span>)}</div></div>
                {formData.hasPropertyException && d.isWorkUnablePropertyExempt === false && <div className="calc-notice">
                    {(d.workUnableNetProperty ?? 0) > (d.workUnablePropertyLimit ?? 0) && <p className="calc-exception-reason">순재산 {money(d.workUnableNetProperty!)}이 재산특례 기준 {money(d.workUnablePropertyLimit ?? 0)}을 {money(d.workUnableNetProperty! - (d.workUnablePropertyLimit ?? 0))} 초과했습니다.</p>}
                    {(d.workUnableFinancialProperty ?? 0) > (d.workUnableFinancialLimit ?? 0) && <p className="calc-exception-reason">금융재산 {money(d.workUnableFinancialProperty!)}이 재산특례 기준 {money(d.workUnableFinancialLimit ?? 0)}을 {money(d.workUnableFinancialProperty! - (d.workUnableFinancialLimit ?? 0))} 초과했습니다.</p>}
                    <p className="calc-exception-reason">재산특례가 적용되지 않아 일반 재산 기준으로 계산했습니다.</p>
                </div>}
                {property === 0 ? <div className="calc-zero-property">
                    <div className="calc-overview calc-zero-formula" aria-label="재산 평가액과 부채 기준 순재산">
                        <div className="calc-stat" data-tone="income">
                            <span className="calc-stat-icon"><CalculationIcon name="property" /></span>
                            <span className="calc-stat-label">총재산</span>
                            <strong>{money(evaluatedTotalProperty)}</strong>
                            <small>모든 재산의 합계</small>
                        </div>
                        <span className="calc-operator" aria-hidden="true">−</span>
                        <div className="calc-stat" data-tone="property">
                            <span className="calc-stat-icon"><CalculationIcon name="document" /></span>
                            <span className="calc-stat-label">부채</span>
                            <strong>{money(debtInput)}</strong>
                            <small>모든 재산에서 차감할 부채 금액</small>
                        </div>
                        <span className="calc-operator" aria-hidden="true">＝</span>
                        <div className="calc-stat is-total">
                            <span className="calc-stat-icon"><CalculationIcon name="total" /></span>
                            <span className="calc-stat-label">순재산</span>
                            <strong>{money(evaluatedNetProperty)}</strong>
                            <small>모든 재산에서 부채를 차감한 금액</small>
                        </div>
                    </div>
                    {d.residentialPropertyRate < 1 && <p className="calc-footnote">전·월세 주거용 재산 {money(d.residentialPropertyRaw)} × {Math.round(d.residentialPropertyRate * 100)}% = {money(evaluatedResidentialProperty)}을 총재산에 반영했습니다.</p>}
                    {input('automobileProperty') > 0 && d.automobilePropertyRaw === 0 && <p className="calc-footnote">재산 산정에서 제외된 자동차는 총재산에 포함하지 않았습니다.</p>}
                    {debtInput > evaluatedTotalProperty && <p className="calc-footnote">부채가 총재산보다 많아 순재산은 0원으로 표시합니다.</p>}
                    <div className="calc-zero-reason"><CalculationIcon name="total" /><p>{d.isWorkUnablePropertyExempt
                        ? <>재산특례 기준 <strong>({regions[formData.region] ?? formData.region} : {money(d.workUnablePropertyLimit ?? 0)})</strong>을 충족하므로 소득으로 환산되는 금액은 없습니다.</>
                        : evaluatedNetProperty <= (d.basicPropertyDeduction ?? 0)
                            ? <>순재산이 기본재산공제 금액 <strong>({regions[formData.region] ?? formData.region}: {money(d.basicPropertyDeduction ?? 0)})</strong> 이하이므로 소득으로 환산되는 금액은 없습니다.</>
                            : <>기본재산공제 <strong>({regions[formData.region] ?? formData.region}: {money(d.basicPropertyDeduction ?? 0)})</strong>{(d.financialFixedDeductionAmount ?? 0) > 0 ? <> 및 생활준비금 공제 <strong>{money(d.financialFixedDeductionAmount!)}</strong></> : null}을 적용한 결과, 소득으로 환산되는 금액은 없습니다.</>}
                    </p></div>
                </div> : <>
                <p className="calc-section-description">재산가액에서 부채를 먼저 차감하고 기본재산을 공제한 뒤, 남은 금액에 재산별 월 환산율을 적용합니다.</p>
                {d.basicPropertyDeduction !== undefined && <p className="calc-footnote">이 계산에 적용한 지역별 기본재산 공제 기준: {money(d.basicPropertyDeduction)}</p>}
                {d.isWorkUnablePropertyExempt ? <div className="calc-exemption"><h4>재산특례 적용 · 월 환산액 0원</h4><p>근로무능력 가구의 순재산·금융재산 조건을 충족해 재산을 소득으로 환산하지 않았습니다.</p><AmountRow label="가구 순재산" value={d.workUnableNetProperty ?? 0} /><AmountRow label="순재산 기준 상한" value={d.workUnablePropertyLimit ?? 0} /><AmountRow label="금융재산" value={d.workUnableFinancialProperty ?? 0} /><AmountRow label="금융재산 기준 상한" value={d.workUnableFinancialLimit ?? 0} /></div> : <div className="calc-property-grid">{propertyCards.map(card => <article className="calc-property-card" data-property={card.id} key={card.id}><div className="calc-property-card-heading"><span className="calc-property-icon"><CalculationIcon name={card.id === 'residential' ? 'home' : card.id === 'general' ? 'property' : 'bank'} /></span><h4>{card.label}</h4></div><strong className="calc-property-value">{money(card.result)}<small>월 환산액</small></strong><div className="calc-mini-flow"><span>환산 대상 금액 {money(card.target)}</span><span>× 월 {card.rate.toFixed(2)}%</span></div><Expand title="계산 과정 보기">
                    {card.id !== 'general' && <AmountRow label={card.id === 'financial' ? '금융재산 입력금액' : '주거용 재산 입력금액'} value={card.raw} />}
                    {card.id === 'residential' && <>{(formData.housingType === 'jeonse' || formData.housingType === 'wolse') && <AmountRow label={`전·월세 보증금 환산 (${Math.round(d.residentialPropertyRate * 100)}%)`} value={d.residentialPropertyRaw * d.residentialPropertyRate} />}{(d.residentialExcess ?? 0) > 0 && <><hr className="calc-property-subtotal-divider" /><AmountRow label="주거용 재산 한도" value={d.residentialPropertyForCalc ?? d.residentialPropertyRaw * d.residentialPropertyRate} /><p className="calc-footnote">한도 초과액 {money(d.residentialExcess!)}은 일반재산에 합산했습니다.</p></>}</>}
                    {card.id === 'general' && <><AmountRow label="일반재산 입력금액" value={d.generalPropertyRaw} /><AmountRow label="자동차" value={d.automobilePropertyRaw} />{(d.residentialExcess ?? 0) > 0 && <AmountRow label="주거용재산 한도 초과액" value={d.residentialExcess ?? 0} />}<hr className="calc-property-subtotal-divider" /><AmountRow label="일반재산 합계" value={card.raw} /></>}
                    <AmountRow label="부채 차감" value={card.debt} subtract />
                    <AmountRow label="기본재산 공제" value={card.basic} subtract />
                    {card.id === 'financial' && <>
                        <hr className="calc-property-subtotal-divider" />
                        <AmountRow label="부채·기본재산 공제 후 잔액" value={Math.max(0, card.raw - card.debt - card.basic)} />
                        <AmountRow label="생활준비금 공제" value={d.financialFixedDeductionAmount ?? 0} subtract />
                    </>}
                    <hr className="calc-property-subtotal-divider" />
                    <AmountRow label="환산 대상 금액" value={card.target} />
                </Expand></article>)}</div>}
                {input('automobileProperty') > 0 && <Expand title="자동차 반영 내역" icon="car">
                    <AmountRow label="입력한 자동차 가액" value={input('automobileProperty')} />
                    <AmountRow label="일반재산에 반영한 자동차" value={d.automobilePropertyRaw} />
                    <p>{input('automobileProperty') > 0 && d.automobilePropertyRaw === 0 ? '입력한 자동차는 재산 산정에서 제외되었습니다.' : '자동차 반영액은 일반재산에 포함됩니다.'}</p>
                </Expand>}
                <Expand title="기본재산 공제·부채 차감 내역" icon="property">
                    <AmountRow label={`기본재산 공제 금액 (${regions[formData.region] ?? formData.region})`} value={d.basicPropertyDeduction ?? 0} />
                    <AmountRow label="입력한 부채 합계" value={d.debtRaw} />
                    {d.isWorkUnablePropertyExempt
                        ? <>
                            <p>재산특례가 적용되어 재산의 소득환산액은 0원입니다. 일반적인 기본재산 공제 배분 방식은 적용하지 않습니다.</p>
                            <AmountRow label="특례 순재산 계산에 반영한 부채" value={d.workUnableDebt ?? 0} subtract />
                        </>
                        : <>
                            <div className="calc-allocation-list">
                                {propertyCards.map(card => <div className="calc-allocation-item" key={card.id}>
                                    <AmountRow label={`${card.label} 공제`} value={card.basic + card.debt} subtract />
                                    <div className="calc-allocation-formula">
                                        <span>부채 차감 <strong>{money(card.debt)}</strong></span>
                                        <span aria-hidden="true">＋</span>
                                        <span>기본재산 공제 <strong>{money(card.basic)}</strong></span>
                                    </div>
                                </div>)}
                            </div>
                            <p>주거용재산 → 일반재산 → 금융재산 순서로 부채를 먼저 차감한 뒤, 기본재산을 공제합니다.</p>
                        </>}
                </Expand>
                </>}
            </section>
            <Expand title="입력한 정보 확인" scrollOnOpen><div className="calc-input-grid"><div><h4>소득 입력</h4>{incomeRows.map(row => row.label === '사적이전소득' && formData.privateTransferType === 'different'
                ? <div className="calc-amount-row" key={row.label}><span>사적이전소득</span><strong>상세 계산내역 확인</strong></div>
                : <AmountRow key={row.label} label={`${row.label}${row.totalInput ? ' (총액)' : ' (월)'}`} value={row.raw} />)}<AmountRow label="지출요인 공제" value={input('expenditureDeduction')} /></div><div><h4>재산·부채 입력</h4><AmountRow label="주거용 재산" value={input('residentialProperty')} /><AmountRow label="일반 재산" value={input('generalProperty')} /><AmountRow label="금융 재산" value={input('financialProperty')} /><AmountRow label="자동차" value={input('automobileProperty')} /><AmountRow label="부채" value={input('debt')} /></div></div></Expand>
        </div>
    </div>;
    return hideWrapper ? body : <dialog ref={dialogRef} className="calc-dashboard-dialog" aria-labelledby="calc-dashboard-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>{body}</dialog>;
}
