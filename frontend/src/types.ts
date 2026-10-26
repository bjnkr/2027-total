export type Unit = 'manwon' | 'won';

export interface EarnedIncome {
    id: number;
    label?: string;
    ageGroup?: string;
    amount: string;
    pension: string;
    type: string;
    amountUnit: Unit;
    pensionUnit: Unit;
}

export interface StepProps {
    formData: UnifiedFormState;
    setFormData: React.Dispatch<React.SetStateAction<UnifiedFormState>>;
    setAlertMessage?: (message: string) => void;
}

export interface UnifiedFormState {
    // 1단계: 기본 정보
    householdSize: string;
    region: string;
    hasPropertyException: boolean;
    isSingleParent: boolean;

    // 2단계: 소득 정보
    earnedIncomes: EarnedIncome[];
    publicTransferIncome: string;

    privateTransferType: 'same' | 'different';
    privateTransferIncome: string;
    privateTransferTwelveMonths: string[];
    privateTransferTwelveMonthUnits: Unit[];
    isFrequentPrivateTransfer: boolean;

    propertyRentalIncome: string;
    propertyInterestIncome: string;
    propertyInterestMonths: string;
    expenditureDeduction: string;

    // 3단계: 자동차
    automobileDisabilityType: string;
    automobileDisplacement: string;
    automobileRegistrationDate: string;
    automobileProperty: string;
    isMultiChildHousehold: boolean;
    automobileSeats: string;

    // 4단계: 재산 및 부채
    housingType: string;
    monthlyRent: string;
    residentialProperty: string;
    generalProperty: string;
    financialProperty: string;
    debt: string;

    inputUnits: Record<string, Unit>;
}

export const initialFormState: UnifiedFormState = {
    householdSize: '1',
    region: 'seoul',
    hasPropertyException: false,
    isSingleParent: false,
    earnedIncomes: [{ id: Date.now(), amount: '', pension: '', type: 'general', amountUnit: 'manwon', pensionUnit: 'manwon' }],
    publicTransferIncome: '',
    privateTransferType: 'same',
    privateTransferIncome: '',
    privateTransferTwelveMonths: Array(12).fill(''),
    privateTransferTwelveMonthUnits: Array(12).fill('manwon'),
    isFrequentPrivateTransfer: false,
    propertyRentalIncome: '',
    propertyInterestIncome: '',
    propertyInterestMonths: '', // 기본값 삭제
    expenditureDeduction: '',
    automobileDisabilityType: 'none',
    automobileDisplacement: '',
    automobileRegistrationDate: '',
    automobileProperty: '',
    isMultiChildHousehold: false,
    automobileSeats: '',
    housingType: 'jeonse',
    monthlyRent: '',
    residentialProperty: '',
    generalProperty: '',
    financialProperty: '',
    debt: '',
    inputUnits: {
        privateTransferIncome: 'manwon',
        publicTransferIncome: 'manwon',
        propertyRentalIncome: 'manwon',
        propertyInterestIncome: 'manwon',
        expenditureDeduction: 'manwon',
        monthlyRent: 'manwon',
        residentialProperty: 'manwon',
        generalProperty: 'manwon',
        automobileProperty: 'manwon',
        financialProperty: 'manwon',
        debt: 'manwon',
    }
};

export interface CalculationDetails {
    totalEarnedRaw: number;
    incomeDetails: {
        raw: number;
        deductionLabel: string;
        deduction: number;
        baseDeduction?: number;
        baseDeductionLimit?: number;
        baseDeductionLabel?: string;
        percentageDeduction?: number;
        percentageRate?: number;
        pensionDeduction: number;
    }[];
    evaluatedEarnedIncome: number;
    privateTransferTotalInput: number;
    privateTransferMedianIncome?: number;
    privateTransferMonthlyDetails?: { input: number; deduction: number; evaluated: number }[];
    privateTransferDeductionPerMonth?: number;
    privateTransferAnnualThreshold?: number;
    privateTransferAfterMonthlyDeduction?: number;
    interestDeduction?: number;
    evaluatedPrivateTransferIncome: number;
    evaluatedPublicTransferIncome: number;
    evaluatedRentalIncome?: number;
    evaluatedInterestIncome?: number;
    expenditureDeductionRaw?: number;
    totalIncomeEvaluation: number;
    residentialPropertyRaw: number;
    residentialPropertyRate: number;
    generalPropertyRaw: number;
    automobilePropertyRaw: number;
    financialPropertyRaw: number;
    debtRaw: number;
    residentialPropertyAfterDeduction: number;
    generalPropertyAfterDeduction: number;
    financialPropertyAfterDeduction: number;
    residentialPropertyConversion: number;
    generalPropertyConversion: number;
    financialPropertyConversion: number;
    totalPropertyConversion: number;
    isWorkUnablePropertyExempt?: boolean;
    workUnableNetProperty?: number;
    workUnableResidentialProperty?: number;
    workUnableGeneralProperty?: number;
    workUnableFinancialProperty?: number;
    workUnableDebt?: number;
    workUnablePropertyLimit?: number;
    workUnableFinancialLimit?: number;
    residentialPropertyLimit?: number;
    residentialExcess?: number;
    residentialPropertyForCalc?: number;
    residentialPropertyDeduction?: number;
    residentialBasicDedUsed?: number;
    residentialDebtUsed?: number;
    totalGeneralProperty?: number;
    generalPropertyDeduction?: number;
    generalBasicDedUsed?: number;
    generalDebtUsed?: number;
    financialFixedDeductionAmount?: number;
    financialRemainingDeductionAmount?: number;
    financialBasicDedUsed?: number;
    financialDebtUsed?: number;
    basicPropertyDeduction?: number;
    financialPropertyRateValue?: number;
}

export interface CalculationResults {
    success: boolean;
    error?: string;
    data?: {
        gicho: {
            income: number;
            medicalIncome?: number;
            medicalDetails?: CalculationDetails;
            eligible: boolean;
            livelihoodEligible: boolean;
            medicalEligible: boolean;
            housingEligible: boolean;
            educationEligible: boolean;
            thresholdLivelihood?: number;
            thresholdMedical?: number;
            thresholdHousing?: number;
            thresholdEducation?: number;
            livelihoodBenefitAmount?: number;
            housingBenefitAmount?: number;
            details?: CalculationDetails;
        };
        hanbumo: {
            income: number;
            eligible: boolean;
            threshold: number;
            details?: CalculationDetails;
        };
        chasangwi: {
            income: number;
            eligible: boolean;
            threshold?: number;
            details?: CalculationDetails;
        };
        chasangwiMedical: {
            income: number;
            eligible: boolean;
            threshold?: number;
            details?: CalculationDetails;
        };
        finalAmounts: Record<string, number>;
    };
}
