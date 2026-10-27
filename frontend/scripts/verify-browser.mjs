import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
    for (const width of [1280, 360]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/api/get_history.php', route => route.fulfill({ json: { success: true, input_data: {
            householdSize: '8', region: 'seoul', hasPropertyException: 'false', isSingleParent: 'false',
            residentialProperty: '15000', generalProperty: '1000', financialProperty: '3000', debt: '5000',
            privateTransferType: 'different', privateTransferTwelveMonths: ['100', '100', '100'],
            propertyInterestIncome: '100', propertyInterestMonths: '12',
        } } }));
        await page.goto('http://127.0.0.1:5173/calc/total2027/');
        await page.locator('#householdSize').waitFor();
        assert.equal(await page.locator('#householdSize').inputValue(), '8');
        assert.equal(await page.locator('#propertyExceptionNo').isChecked(), true);
        await page.locator('.navigation-buttons .next-btn').click();
        await page.locator('.modal-content').getByRole('button', { name: '다음', exact: true }).click();
        await page.getByRole('button', { name: '35세 - 64세', exact: true }).click();
        await page.getByRole('button', { name: '완료', exact: true }).click();
        await page.locator('[id^="earnedIncomeAmount-"]').fill('100');
        await page.locator('[id^="earnedIncomePension-"]').fill('9');
        await page.waitForTimeout(450);
        await page.locator('.navigation-buttons .next-btn').click();
        await page.locator('#automobileProperty').waitFor();
        // Navigation throttling prevents accidental double taps.
        await page.waitForTimeout(450);
        await page.locator('.navigation-buttons .next-btn').click();
        await page.locator('#region').waitFor();
        await page.waitForTimeout(450);
        await page.getByRole('button', { name: '통합 계산하기', exact: true }).click();
        await page.locator('.details-btn-styled').first().waitFor();
        await page.getByRole('button', { name: '예상금액 조회', exact: true }).click();
        await page.locator('.modal-content input[inputmode="numeric"]').fill('100');
        await page.locator('.modal-content').getByRole('button', { name: '확인', exact: true }).click();
        const housing = page.locator('.benefit-item-card.housing');
        await housing.locator('.benefit-item-header').click();
        assert.match(await housing.textContent(), /804,000/);
        await page.locator('.details-btn-styled').first().click();
        const dialog = page.locator('dialog.calc-dashboard-dialog');
        await dialog.waitFor();
        assert.equal(await dialog.locator('.calc-scheme-switch').count(), 1);
        await dialog.getByRole('button', { name: '의료급여', exact: true }).click();
        assert.match(await dialog.locator('.calc-notice').first().textContent(), /의료급여/);
        await dialog.getByRole('button', { name: '생계·주거·교육급여', exact: true }).click();
        await dialog.locator('summary').filter({ hasText: '근로·사업소득 계산내역' }).click();
        await dialog.locator('summary').filter({ hasText: '이자소득 계산내역' }).click();
        await dialog.locator('summary').filter({ hasText: '사적이전소득 계산 내역' }).click();
        assert.equal(await dialog.locator('.private-monthly-table tbody tr').count(), 12);
        const unitVisible = await dialog.locator('.private-table-unit').first().isVisible();
        assert.equal(unitVisible, width > 600);
        const deducted = dialog.locator('.calc-member .is-deduction strong').first();
        assert.equal(await deducted.evaluate(el => getComputedStyle(el).color), 'rgb(220, 38, 38)');
        assert.equal(await dialog.locator('.calc-property-conversion-breakdown').isVisible(), width > 760);
        const inputSummary = dialog.locator('summary').filter({ hasText: '입력한 정보 확인' });
        await inputSummary.click();
        const visible = await inputSummary.evaluate(el => {
            const body = el.closest('.calc-dashboard-body').getBoundingClientRect();
            const bounds = el.getBoundingClientRect();
            return bounds.top >= body.top - 1 && bounds.bottom <= body.bottom + 1;
        });
        assert.equal(visible, true);
        const overflow = await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1);
        assert.equal(overflow, false);
        await dialog.getByRole('button', { name: '상세내역 닫기' }).click();
        assert.equal(await dialog.count(), 0);
        assert.deepEqual(errors, []);
        console.log(`PASS: ${width}px browser flow, restored input, 4 steps, calculation, modal, scheme switch, monthly table, responsive labels, red deductions, auto-scroll, no runtime errors.`);
        await page.close();
    }
} finally {
    await browser.close();
}
