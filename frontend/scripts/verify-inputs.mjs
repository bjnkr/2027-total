import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
    const { initialFormState } = await server.ssrLoadModule('/src/types.ts');
    const { normalizeFormState } = await server.ssrLoadModule('/src/normalizeFormState.ts');
    assert.deepEqual(normalizeFormState(initialFormState), { ...initialFormState, earnedIncomes: initialFormState.earnedIncomes.map(income => ({ ...income, label: undefined, ageGroup: undefined })) });
    const restored = normalizeFormState({ hasPropertyException: 'false', isSingleParent: 'false',
        isMultiChildHousehold: 'false', isFrequentPrivateTransfer: 'false', inputUnits: { financialProperty: 'won' },
        financialProperty: '1,000,000', privateTransferTwelveMonths: ['100'], earnedIncomes: [{ amount: '1,000', pension: '9' }] });
    assert.equal(restored.hasPropertyException, false);
    assert.equal(restored.isSingleParent, false);
    assert.equal(restored.isMultiChildHousehold, false);
    assert.equal(restored.isFrequentPrivateTransfer, false);
    assert.equal(restored.financialProperty, '1000000');
    assert.equal(restored.inputUnits.financialProperty, 'won');
    assert.equal(restored.inputUnits.debt, 'manwon');
    assert.equal(restored.privateTransferTwelveMonths.length, 12);
    assert.equal(restored.earnedIncomes[0].amountUnit, 'manwon');
    assert.equal(normalizeFormState(null).householdSize, '1');

    const request = async body => {
        const response = await fetch('http://127.0.0.1:5173/calc/total2027/api/calculate.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        assert.match(response.headers.get('content-type'), /application\/json/);
        return { status: response.status, json: await response.json() };
    };
    const valid = { ...structuredClone(initialFormState), financialProperty: '1000', debt: '100', privateTransferIncome: '300' };
    const expected = await request(valid);
    assert.equal(expected.status, 200);
    const legacy = await request({ ...valid, hasPropertyException: 'false', isFrequentPrivateTransfer: 'false',
        financialProperty: '1,000', privateTransferTwelveMonths: [], privateTransferTwelveMonthUnits: [] });
    assert.deepEqual(legacy.json, expected.json);
    const partial = await request({ householdSize: '2' });
    assert.equal(partial.status, 200);
    assert.equal(partial.json.data.gicho.income, 0);

    const invalid = [null, [], {}, 'bad', { ...valid, region: 'invalid' }, { ...valid, householdSize: '11' },
        { ...valid, debt: '-1' }, { ...valid, residentialProperty: {} }, { ...valid, inputUnits: 'won' },
        { ...valid, earnedIncomes: {} }, { ...valid, earnedIncomes: [null] }, { ...valid, privateTransferTwelveMonths: Array(13).fill('') },
        { ...valid, inputUnits: { debt: 'dollar' } }, { ...valid, hasPropertyException: 'invalid' }];
    for (const form of invalid) {
        const result = await request(form);
        assert.equal(result.status, 400, JSON.stringify(form));
        assert.equal(result.json.success, false);
        assert.equal(typeof result.json.error, 'string');
    }
    const history = await fetch('http://127.0.0.1:5173/calc/total2027/api/get_history.php');
    assert.equal((await history.json()).success, false);
    for (const region of ['seoul', 'gyeonggi', 'metro', 'other']) {
        const form = { ...structuredClone(initialFormState), region, hasPropertyException: true, housingType: 'owned' };
        const probe = (await request(form)).json.data.gicho.details;
        const propertyLimit = probe.workUnablePropertyLimit;
        const financialLimit = probe.workUnableFinancialLimit;
        for (const [field, limit] of [['residentialProperty', propertyLimit], ['financialProperty', financialLimit]]) {
            for (const excess of [0, 1]) {
                const result = await request({ ...form, [field]: String(limit + excess), inputUnits: { ...form.inputUnits, [field]: 'won' } });
                assert.equal(result.json.data.gicho.details.isWorkUnablePropertyExempt, excess === 0, `${region}/${field}/${excess}`);
            }
        }
    }
    const wonForm = { ...valid, financialProperty: '10000000', debt: '1000000', privateTransferIncome: '3000000',
        inputUnits: { ...valid.inputUnits, financialProperty: 'won', debt: 'won', privateTransferIncome: 'won' } };
    assert.deepEqual((await request(wonForm)).json, expected.json);
    console.log(`PASS: saved-form restoration, ${invalid.length} invalid requests, partial input, comma amounts, string booleans, and anonymous history.`);
    console.log('PASS: 16 property-exemption boundary cases across 4 regions, and won/manwon equivalence.');
} finally {
    await server.close();
}
