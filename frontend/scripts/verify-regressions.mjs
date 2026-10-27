import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const baselinePath = new URL('../node_modules/.cache/calculation-baseline.json', import.meta.url);
try {
    const { initialFormState } = await server.ssrLoadModule('/src/types.ts');
    const snapshots = [];
    for (const region of ['seoul', 'gyeonggi', 'metro', 'other']) {
        for (let size = 1; size <= 10; size++) {
            for (const housingType of ['jeonse', 'owned']) {
                for (const hasPropertyException of [false, true]) {
                    const form = { ...structuredClone(initialFormState), region, householdSize: String(size), housingType, hasPropertyException,
                        residentialProperty: String(3500 + size * 2300), generalProperty: String(size * 550),
                        financialProperty: String(size * 700), debt: String(size * 1500),
                        earnedIncomes: [{ id: 1, amount: String(size * 40), pension: '9', type: size % 2 ? 'general' : 'student', amountUnit: 'manwon', pensionUnit: 'manwon' }],
                        privateTransferType: 'different', privateTransferTwelveMonths: Array.from({ length: 12 }, (_, i) => i < size ? '100' : ''),
                        propertyInterestIncome: '100', propertyInterestMonths: '24', monthlyRent: '100',
                    };
                    const response = await fetch('http://127.0.0.1:5173/calc/total2027/api/calculate.php', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
                    });
                    assert.equal(response.status, 200);
                    const result = await response.json();
                    assert.equal(result.success, true);
                    for (const scheme of ['gicho', 'hanbumo', 'chasangwi', 'chasangwiMedical']) {
                        const { income, details } = result.data[scheme];
                        assert.equal(income, Math.round(details.totalIncomeEvaluation + details.totalPropertyConversion));
                        assert.ok(Number.isFinite(income) && income >= 0);
                    }
                    const rent = result.data.gicho.standardRentByRegion;
                    if (rent) {
                        assert.equal(Object.keys(rent).length, 4);
                        if (size === 8) assert.equal(rent.seoul, 804000);
                        if (size === 10) assert.equal(rent.gyeonggi, 723000);
                        // This new field replaces the duplicate frontend rent table.
                        delete result.data.gicho.standardRentByRegion;
                    }
                    snapshots.push(result);
                }
            }
        }
    }
    if (process.argv.includes('--record')) {
        await mkdir(new URL('../node_modules/.cache/', import.meta.url), { recursive: true });
        await writeFile(baselinePath, JSON.stringify(snapshots));
        console.log(`Recorded ${snapshots.length} pre-refactor API responses.`);
    } else {
        if (process.argv.includes('--compare')) assert.deepEqual(snapshots, JSON.parse(await readFile(baselinePath, 'utf8')));
        console.log(`PASS: ${snapshots.length} API scenarios, ${snapshots.length * 4} scheme totals${process.argv.includes('--compare') ? ', identical to pre-refactor responses' : ''}.`);
    }
} finally {
    await server.close();
}
