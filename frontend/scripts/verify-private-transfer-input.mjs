import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
try {
    for (const { width, height } of [{ width: 1280, height: 900 }, { width: 360, height: 900 }, { width: 320, height: 480 }]) {
        const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/api/get_history.php', route => route.fulfill({ json: { success: true, input_data: null } }));
        await page.goto('http://127.0.0.1:5173/calc/total2027/');
        await page.locator('#householdSize').waitFor();
        await page.locator('.next-btn').click();
        const memberDialog = page.locator('.earned-income-dialog');
        await memberDialog.getByRole('button', { name: '없음', exact: true }).click();
        await memberDialog.getByRole('button', { name: '다음', exact: true }).click();
        await page.locator('#privateTransferDifferent').check();
        const dialog = page.locator('.private-transfer-input-dialog');
        assert.equal(await dialog.locator('[id^="privateTransferMonth-"]').count(), 12);
        assert.equal(await dialog.evaluate(el => el.scrollTop), 0);
        await dialog.locator('#privateTransferMonth-1').fill('100');
        await dialog.getByRole('button', { name: '2월 지원금액 단위 변경', exact: true }).click();
        await dialog.locator('#privateTransferMonth-2').fill('50000');
        await dialog.locator('#isFrequentPrivateTransfer').check();
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        const summary = page.locator('.private-transfer-entry-card');
        assert.match(await summary.textContent(), /1,050,000원/);
        assert.match(await summary.textContent(), /2개월/);
        assert.match(await summary.textContent(), /정기 지원/);
        assert.equal(await page.locator('[id^="privateTransferMonth-"]').count(), 0);

        await summary.getByRole('button').click();
        assert.equal(await dialog.locator('#privateTransferMonth-2').inputValue(), '50,000');
        await dialog.locator('#privateTransferMonth-1').fill('200');
        await dialog.getByRole('button', { name: '취소', exact: true }).click();
        assert.match(await summary.textContent(), /1,050,000원/);

        await summary.getByRole('button').click();
        await dialog.getByRole('button', { name: '입력 초기화', exact: true }).click();
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        assert.equal(await summary.locator('dl').count(), 0);
        await summary.getByRole('button').click();
        for (let month = 1; month <= 6; month++) {
            if (month === 2) await dialog.getByRole('button', { name: '2월 지원금액 단위 변경', exact: true }).click();
            await dialog.locator(`#privateTransferMonth-${month}`).fill('100');
        }
        assert.equal(await dialog.locator('#isFrequentPrivateTransfer').isChecked(), true);
        assert.equal(await dialog.locator('#isFrequentPrivateTransfer').isDisabled(), true);
        await dialog.locator('#privateTransferMonth-1').press('Enter');
        assert.equal(await dialog.count(), 1);
        assert.equal(await dialog.locator('#privateTransferMonth-2').evaluate(el => el === document.activeElement), true);
        assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
        await dialog.evaluate(el => { el.scrollTop = 0; });
        const headerBefore = await dialog.locator('header').boundingBox();
        const scrollDistance = await dialog.evaluate(el => { el.scrollTop = el.scrollHeight; return el.scrollTop; });
        const headerAfter = await dialog.locator('header').boundingBox();
        if (scrollDistance > 0) assert.ok(headerAfter.y < headerBefore.y);
        assert.equal(await dialog.locator('.private-transfer-input-body').evaluate(el => getComputedStyle(el).overflowY), 'visible');
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).scrollIntoViewIfNeeded();
        const footer = await dialog.locator('footer').boundingBox();
        assert.ok(footer.y + footer.height <= height);
        await dialog.getByRole('button', { name: '입력 완료', exact: true }).click();
        assert.match(await summary.textContent(), /6,000,000원/);

        await page.locator('#privateTransferSame').check();
        await page.locator('#privateTransferIncome').waitFor();
        await page.locator('#privateTransferDifferent').check();
        await page.keyboard.press('Escape');
        assert.equal(await dialog.count(), 0);
        assert.match(await summary.textContent(), /6,000,000원/);
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
        assert.equal(sent.privateTransferType, 'different');
        assert.deepEqual(sent.privateTransferTwelveMonths.slice(0, 6), Array(6).fill('100'));
        assert.equal(sent.privateTransferTwelveMonths[6], '');
        assert.equal(sent.isFrequentPrivateTransfer, true);
        await page.locator('.details-btn-styled').first().waitFor();
        assert.deepEqual(errors, []);
        console.log(`PASS ${width}px: 12 monthly amounts, mixed units, manual/automatic frequency, summary, draft cancellation, reset, Escape, Enter, type switching and calculation payload.`);
        await page.close();
    }
} finally { await browser.close(); }
