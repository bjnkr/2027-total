import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
    for (const width of [1280, 360]) {
        const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/api/get_history.php', route => route.fulfill({ json: { success: true, input_data: null } }));
        await page.goto('http://127.0.0.1:5173/calc/total2027/');
        await page.locator('#householdSize').waitFor();
        await page.locator('.next-btn').click();
        const memberDialog = page.locator('.earned-income-dialog');
        await memberDialog.getByRole('button', { name: '없음', exact: true }).click();
        await memberDialog.getByRole('button', { name: '다음', exact: true }).click();
        const summary = page.locator('.interest-entry-card');
        await summary.getByRole('button').click();
        const dialog = page.locator('.interest-input-dialog');
        await dialog.locator('#propertyInterestIncome').fill('100');
        await dialog.locator('#propertyInterestMonths').fill('0');
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        assert.match(await dialog.getByRole('alert').textContent(), /1개월/);
        await dialog.locator('#propertyInterestMonths').fill('12');
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        assert.equal(await dialog.count(), 0);
        assert.match(await summary.textContent(), /1,000,000원/);
        assert.match(await summary.textContent(), /12개월/);

        await summary.getByRole('button').click();
        assert.equal(await dialog.locator('#propertyInterestIncome').inputValue(), '100');
        await dialog.locator('#propertyInterestIncome').fill('999');
        await dialog.getByRole('button', { name: '취소', exact: true }).click();
        assert.match(await summary.textContent(), /1,000,000원/);
        await summary.getByRole('button').click();
        await dialog.getByRole('button', { name: '입력 초기화', exact: true }).click();
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        assert.equal(await summary.locator('dl').count(), 0);

        await summary.getByRole('button').click();
        await dialog.getByRole('button', { name: '이자소득 금액 단위 변경' }).click();
        await dialog.locator('#propertyInterestIncome').fill('1234567');
        await dialog.locator('#propertyInterestMonths').fill('24');
        assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
        // Enter saves the dialog instead of submitting the surrounding calculator form.
        await dialog.locator('#propertyInterestMonths').press('Enter');
        assert.equal(await dialog.count(), 0);
        assert.match(await summary.textContent(), /1,234,567원/);
        assert.match(await summary.textContent(), /24개월/);
        assert.equal(await page.locator('.income-input-step').count(), 1);

        await page.waitForTimeout(450);
        await page.locator('.navigation-buttons .next-btn').click();
        await page.locator('#automobileProperty').waitFor();
        await page.waitForTimeout(450);
        await page.locator('.navigation-buttons .next-btn').click();
        await page.locator('#region').waitFor();
        await page.waitForTimeout(450);
        const request = page.waitForRequest(request => request.url().endsWith('/api/calculate.php') && request.method() === 'POST');
        await page.getByRole('button', { name: '통합 계산하기', exact: true }).click();
        const sent = (await request).postDataJSON();
        assert.equal(sent.propertyInterestIncome, '1234567');
        assert.equal(sent.propertyInterestMonths, '24');
        assert.equal(sent.inputUnits.propertyInterestIncome, 'won');
        await page.locator('.details-btn-styled').first().waitFor();
        assert.deepEqual(errors, []);
        console.log(`PASS ${width}px: interest modal, period validation, summary, edit/cancel, reset, units, Enter, API payload and calculation.`);
        await page.close();
    }
} finally { await browser.close(); }
