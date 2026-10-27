import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
    const { initialFormState } = await server.ssrLoadModule('/src/types.ts');
    const { default: Dashboard } = await server.ssrLoadModule('/src/components/CalculationDetailsModal.tsx');
    const base = structuredClone(initialFormState);
    const sample = { ...structuredClone(base), householdSize: '2', region: 'other',
        earnedIncomes: [{ id: 1, amount: '200', pension: '9', type: 'general', amountUnit: 'manwon', pensionUnit: 'manwon' }],
        privateTransferIncome: '100', publicTransferIncome: '30', propertyRentalIncome: '50', propertyInterestIncome: '100', propertyInterestMonths: '12',
        expenditureDeduction: '30', residentialProperty: '10000', generalProperty: '1000', financialProperty: '3000', automobileProperty: '500', debt: '2000' };
    const fixtures = [
        ['empty', base], ['sample', sample],
        ['empty-monthly-support', { ...structuredClone(base), privateTransferType: 'different' }],
        ['fully-deducted-income', { ...structuredClone(base), privateTransferIncome: '1', propertyInterestIncome: '1' }],
        ['irregular-support', { ...sample, privateTransferType: 'different', privateTransferTwelveMonths: ['300', '300', '300', ...Array(9).fill('')] }],
        ['regular-support', { ...sample, privateTransferType: 'different', privateTransferTwelveMonths: Array(12).fill('150') }],
        ['property-exemption', { ...structuredClone(base), hasPropertyException: true, residentialProperty: '1000', financialProperty: '100', debt: '100' }],
        ['property-exemption-exceeded', { ...sample, hasPropertyException: true, financialProperty: '10000' }],
        ['residential-limit', { ...sample, residentialProperty: '50000', housingType: 'owned', propertyInterestMonths: '24' }],
        ['debt-before-basic-seoul', { ...structuredClone(base), region: 'seoul', residentialProperty: '15000', generalProperty: '1000', financialProperty: '3000', debt: '5000' }],
        ['deduction-exceeds-income', { ...sample, expenditureDeduction: '1000', automobileDisabilityType: 'severe', automobileDisplacement: '1500' }],
        ...['student', 'youth', 'senior', 'student_over_35', 'disabled', 'single_parent_youth', 'disabled_rehab'].map(type => [
            `earned-${type}`, { ...sample, earnedIncomes: [{ ...sample.earnedIncomes[0], type, amount: '100' }] },
        ]),
        ['earned-below-base', { ...sample, earnedIncomes: [{ ...sample.earnedIncomes[0], type: 'student', amount: '30' }] }],
        ...['3000', '4000', '2000'].map(debt => [
            `financial-debt-first-${debt}`, { ...structuredClone(base), region: 'other', residentialProperty: '5000', generalProperty: '1000', financialProperty: '3000', debt },
        ]),
        ['zero-property-jeonse-95', { ...structuredClone(base), region: 'other', residentialProperty: '5000', generalProperty: '1000', financialProperty: '2800', debt: '3000' }],
    ];
    let comparisons = 0;
    for (const [name, form] of fixtures) {
        const response = await fetch('http://127.0.0.1:5173/calc/total2027/api/calculate.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
        assert.equal(response.status, 200);
        const json = await response.json();
        assert.equal(json.success, true);
        for (const scheme of ['gicho', 'hanbumo', 'chasangwi', 'chasangwiMedical']) {
            const result = json.data[scheme];
            const d = result.details;
            for (const item of d.incomeDetails) {
                assert.ok(Math.abs(item.baseDeduction + item.percentageDeduction - item.deduction) < 0.001);
                assert.ok(Math.abs(item.percentageDeduction - Math.max(0, item.raw - item.baseDeduction) * item.percentageRate) < 0.001);
                assert.ok(item.baseDeduction <= item.raw);
            }
            if (name === 'earned-student') {
                const item = d.incomeDetails[0];
                assert.equal(item.baseDeduction, 600000);
                assert.equal(item.percentageDeduction, 120000);
                assert.equal(item.pensionDeduction, 67500);
                assert.equal(d.evaluatedEarnedIncome, 212500);
            }
            if (name === 'earned-disabled_rehab') assert.equal(d.incomeDetails[0].percentageRate, 0.5);
            assert.equal(Math.round(d.totalIncomeEvaluation + d.totalPropertyConversion), result.income, `${name}/${scheme}: final amount`);
            assert.ok(Math.abs(d.totalPropertyConversion - d.residentialPropertyConversion - d.generalPropertyConversion - d.financialPropertyConversion) < 0.001);
            if (!d.isWorkUnablePropertyExempt) {
                const financialRemainder = d.financialPropertyRaw - d.financialBasicDedUsed - d.financialDebtUsed;
                assert.equal(d.financialFixedDeductionAmount, Math.min(5000000, financialRemainder));
                assert.equal(d.financialPropertyAfterDeduction, financialRemainder - d.financialFixedDeductionAmount);
                assert.ok(d.residentialDebtUsed + d.generalDebtUsed + d.financialDebtUsed <= d.debtRaw);
                let remainingDebt = d.debtRaw;
                let remainingBasic = d.basicPropertyDeduction;
                let combinedDeduction = remainingDebt + remainingBasic;
                for (const [raw, debt, basic, target, financial] of [
                    [d.residentialPropertyForCalc, d.residentialDebtUsed, d.residentialBasicDedUsed, d.residentialPropertyAfterDeduction, false],
                    [d.totalGeneralProperty, d.generalDebtUsed, d.generalBasicDedUsed, d.generalPropertyAfterDeduction, false],
                    [d.financialPropertyRaw, d.financialDebtUsed, d.financialBasicDedUsed, d.financialPropertyAfterDeduction, true],
                ]) {
                    const deducted = Math.min(raw, combinedDeduction);
                    assert.equal(debt, Math.min(raw, remainingDebt), `${name}/${scheme}: debt first`);
                    assert.equal(basic, Math.min(raw - debt, remainingBasic), `${name}/${scheme}: basic deduction after debt`);
                    assert.equal(target, Math.max(0, raw - deducted - (financial ? 5000000 : 0)), `${name}/${scheme}: conversion target unchanged`);
                    remainingDebt -= debt;
                    remainingBasic -= basic;
                    combinedDeduction -= deducted;
                }
            }
            if (scheme === 'gicho' && name === 'financial-debt-first-3000') {
                assert.equal(d.financialDebtUsed, 0);
                assert.equal(d.financialBasicDedUsed, 25500000);
                assert.equal(d.financialFixedDeductionAmount, 4500000);
                assert.equal(d.financialPropertyAfterDeduction, 0);
            }
            if (scheme === 'gicho' && name === 'debt-before-basic-seoul') {
                assert.equal(d.residentialDebtUsed, 50000000);
                assert.equal(d.generalDebtUsed, 0);
                assert.equal(d.residentialBasicDedUsed, 92500000);
                assert.equal(d.generalBasicDedUsed, 6500000);
                assert.equal(d.generalPropertyAfterDeduction, 3500000);
                assert.equal(d.totalPropertyConversion, 1710950);
            }
            if (scheme === 'gicho' && name === 'financial-debt-first-4000') {
                assert.equal(d.financialDebtUsed, 0);
                assert.equal(d.financialBasicDedUsed, 30000000);
                assert.equal(d.financialFixedDeductionAmount, 0);
            }
            if (scheme === 'gicho' && name === 'financial-debt-first-2000') {
                assert.equal(d.financialDebtUsed, 0);
                assert.equal(d.financialBasicDedUsed, 15500000);
                assert.equal(d.financialFixedDeductionAmount, 5000000);
                assert.equal(d.financialPropertyAfterDeduction, 9500000);
            }
            const html = renderToStaticMarkup(React.createElement(Dashboard, {
                title: scheme, formData: form, details: d, finalIncome: result.income,
                medicalDetails: result.medicalDetails, medicalIncome: result.medicalIncome,
                excludePrivateTransfer: scheme.startsWith('chasangwi'), hideWrapper: true, onClose() {},
            }));
            assert.ok(!/NaN|undefined/.test(html), `${name}/${scheme}: invalid amount`);
            assert.equal(html.includes('class="calc-scheme-switch"'), Boolean(result.medicalDetails) && Math.round(result.medicalIncome ?? result.income) !== Math.round(result.income), `${name}/${scheme}: switch only for different totals`);
            assert.ok(html.indexOf('calc-overview') < html.indexOf('calc-input-grid'), 'Results precede inputs');
            const incomeTable = html.slice(html.indexOf('calc-income-table'), html.indexOf('calc-income-footer'));
            assert.equal(incomeTable.includes('상세 계산내역 확인'), form.privateTransferType === 'different');
            assert.ok(!incomeTable.includes('12개월 월평균'));
            if (name === 'sample') {
                assert.ok(html.includes(`소득공제 (${Math.round(d.incomeDetails[0].percentageRate * 100)}%)`));
                assert.ok(!html.includes('추가공제 (30%)'));
            }
            if (name === 'earned-student') {
                assert.ok(html.includes('소득공제 (대학생)'));
                assert.ok(html.includes('추가공제 (30%)'));
            }
            if (name === 'earned-youth') assert.ok(html.includes('소득공제 (34세 이하 청년)'));
            assert.equal((html.match(/class="calc-stat(?: is-total)?"/g) || []).length, d.totalPropertyConversion === 0 ? 6 : 3);
            assert.ok(html.includes(`${result.income.toLocaleString('ko-KR')}원`));
            assert.equal(html.includes('calc-zero-property'), d.totalPropertyConversion === 0);
            const exceptionRejected = form.hasPropertyException && d.isWorkUnablePropertyExempt === false;
            assert.equal(html.includes('재산특례가 적용되지 않아 일반 재산 기준으로 계산했습니다.'), exceptionRejected);
            for (const [label, value, limit] of [
                ['순재산', d.workUnableNetProperty, d.workUnablePropertyLimit],
                ['금융재산', d.workUnableFinancialProperty, d.workUnableFinancialLimit],
            ]) {
                const reason = `${label} ${Math.round(value ?? 0).toLocaleString('ko-KR')}원이 재산특례 기준 ${Math.round(limit ?? 0).toLocaleString('ko-KR')}원을 ${Math.round((value ?? 0) - (limit ?? 0)).toLocaleString('ko-KR')}원 초과했습니다.`;
                assert.equal(html.includes(reason), exceptionRejected && value > limit);
            }
            if (d.totalPropertyConversion === 0) {
                assert.ok(!html.includes('calc-property-grid'));
                assert.ok(!html.includes('calc-allocation-list'));
                assert.ok(!html.includes('순재산 = 총재산 − 부채'));
                const zeroSummary = html.slice(html.indexOf('calc-zero-property'), html.indexOf('calc-input-grid'));
                const evaluatedTotal = d.residentialPropertyRaw * d.residentialPropertyRate + d.generalPropertyRaw + d.financialPropertyRaw + d.automobilePropertyRaw;
                assert.ok(zeroSummary.includes(`${Math.round(evaluatedTotal).toLocaleString('ko-KR')}원`));
                assert.ok(zeroSummary.includes(`${Math.round(Math.max(0, evaluatedTotal - d.debtRaw)).toLocaleString('ko-KR')}원`));
                if (name === 'zero-property-jeonse-95') {
                    assert.ok(zeroSummary.includes('85,500,000원'));
                    assert.ok(zeroSummary.includes('55,500,000원'));
                    assert.ok(zeroSummary.includes('47,500,000원'));
                    assert.ok(!zeroSummary.includes('88,000,000원'));
                }
                if (d.isWorkUnablePropertyExempt) {
                    const regionLabel = { seoul: '서울', gyeonggi: '경기', metro: '광역·특례시', other: '그 외 지역' }[form.region];
                    assert.ok(zeroSummary.includes(`재산특례 기준 <strong>(${regionLabel} : ${Math.round(d.workUnablePropertyLimit).toLocaleString('ko-KR')}원)</strong>을 충족`));
                }
                if (scheme === 'gicho' && name === 'financial-debt-first-3000') assert.ok(html.includes('및 생활준비금 공제'));
            } else assert.ok(html.includes('calc-property-grid'));
            if (name === 'empty' || name === 'empty-monthly-support') {
                assert.equal((html.match(/입력한 소득이 없습니다\./g) || []).length, 2);
                assert.ok(!html.includes('private-result-card'));
                assert.ok(!html.includes('이자소득 공제'));
            }
            if (name === 'fully-deducted-income') {
                assert.ok(!html.includes('입력한 소득이 없습니다.'));
                assert.ok(html.includes('private-result-card'));
                assert.ok(html.includes('이자소득 공제'));
                assert.equal(d.evaluatedPrivateTransferIncome, 0);
                assert.equal(d.evaluatedInterestIncome, 0);
            }
            if (scheme.startsWith('chasangwi')) {
                assert.equal(d.evaluatedPrivateTransferIncome, 0);
                assert.equal(d.privateTransferMonthlyDetails.length, 0);
                assert.ok(!html.includes('private-monthly-table'));
            } else {
                const rows = d.privateTransferMonthlyDetails;
                assert.equal(rows.length, 12);
                assert.equal(html.includes('private-monthly-table'), form.privateTransferType === 'different' && rows.some(row => row.input > 0));
                for (const row of rows) {
                    assert.equal(row.deduction, Math.min(row.input, d.privateTransferDeductionPerMonth));
                    assert.ok(Math.abs(row.input - row.deduction - row.evaluated) < 0.001);
                }
                const annual = rows.reduce((sum, row) => sum + row.evaluated, 0);
                const monthly = form.privateTransferType === 'same'
                    ? rows[0].evaluated
                    : Math.max(0, annual - d.privateTransferAnnualThreshold) / 12;
                assert.ok(Math.abs(monthly - d.evaluatedPrivateTransferIncome) < 0.001);
            }
            comparisons++;
        }
        const medical = json.data.gicho.medicalDetails;
        if (name === 'sample') assert.equal(medical.incomeDetails[0].percentageRate, 0);
        assert.equal(Math.round(medical.totalIncomeEvaluation + medical.totalPropertyConversion), json.data.gicho.medicalIncome, `${name}: medical calculation`);
        if (name === 'sample') {
            assert.equal(json.data.gicho.income, 4643037);
            assert.ok(json.data.gicho.medicalIncome > json.data.gicho.income);
        }
        if (name === 'property-exemption') assert.equal(json.data.gicho.details.isWorkUnablePropertyExempt, true);
        if (name === 'residential-limit') assert.ok(json.data.gicho.details.residentialExcess > 0);
        if (name === 'deduction-exceeds-income') {
            assert.equal(json.data.gicho.details.totalIncomeEvaluation, 0);
            assert.equal(json.data.gicho.details.automobilePropertyRaw, 0);
        }
    }
    console.log(`PASS: ${fixtures.length} API scenarios, ${comparisons} scheme totals and rendered dashboards, medical breakdown, exclusions, exemption, and housing cap.`);
} finally {
    await server.close();
}
