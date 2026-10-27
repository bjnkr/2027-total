import { initialFormState, type UnifiedFormState, type Unit } from './types';

const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const boolean = (value: unknown) => value === true || value === 'true' || value === 1 || value === '1';
const numeric = (value: unknown) => {
    const text = typeof value === 'string' || typeof value === 'number' ? String(value).replaceAll(',', '').trim() : '';
    return /^\d*$/.test(text) ? text : '';
};
const unit = (value: unknown): Unit => value === 'won' ? 'won' : 'manwon';

export function normalizeFormState(value: unknown): UnifiedFormState {
    const saved = record(value);
    const state = structuredClone(initialFormState);
    for (const key of Object.keys(state) as (keyof UnifiedFormState)[]) {
        if (typeof state[key] === 'string' && typeof saved[key] === 'string') Object.assign(state, { [key]: saved[key] });
    }
    for (const key of ['hasPropertyException', 'isSingleParent', 'isMultiChildHousehold', 'isFrequentPrivateTransfer'] as const) state[key] = boolean(saved[key]);
    if (!['seoul', 'gyeonggi', 'metro', 'other'].includes(state.region)) state.region = initialFormState.region;
    if (!Array.from({ length: 10 }, (_, i) => String(i + 1)).includes(state.householdSize)) state.householdSize = '1';
    if (!['jeonse', 'wolse', 'owned', 'free'].includes(state.housingType)) state.housingType = initialFormState.housingType;
    if (!['same', 'different'].includes(state.privateTransferType)) state.privateTransferType = 'same';
    if (!['none', 'mild', 'severe'].includes(state.automobileDisabilityType)) state.automobileDisabilityType = 'none';
    const savedUnits = record(saved.inputUnits);
    for (const key of Object.keys(state.inputUnits)) {
        state.inputUnits[key] = unit(savedUnits[key]);
        Object.assign(state, { [key]: numeric(saved[key]) });
    }
    for (const key of ['propertyInterestMonths', 'automobileDisplacement', 'automobileSeats', 'automobileRegistrationDate'] as const) state[key] = numeric(saved[key]);
    const earnedTypes = ['general', 'youth', 'student', 'senior', 'student_over_35', 'disabled', 'single_parent_youth', 'disabled_rehab'];
    if (Array.isArray(saved.earnedIncomes)) state.earnedIncomes = saved.earnedIncomes.map((item, index) => {
        const income = record(item);
        return { id: typeof income.id === 'number' ? income.id : index + 1,
            label: typeof income.label === 'string' ? income.label : undefined,
            ageGroup: typeof income.ageGroup === 'string' ? income.ageGroup : undefined,
            amount: numeric(income.amount), pension: numeric(income.pension),
            type: typeof income.type === 'string' && earnedTypes.includes(income.type) ? income.type : 'general',
            amountUnit: unit(income.amountUnit), pensionUnit: unit(income.pensionUnit) };
    });
    const monthly = Array.isArray(saved.privateTransferTwelveMonths) ? saved.privateTransferTwelveMonths : [];
    const units = Array.isArray(saved.privateTransferTwelveMonthUnits) ? saved.privateTransferTwelveMonthUnits : [];
    state.privateTransferTwelveMonths = Array.from({ length: 12 }, (_, i) => numeric(monthly[i]));
    state.privateTransferTwelveMonthUnits = Array.from({ length: 12 }, (_, i) => unit(units[i]));
    return state;
}
