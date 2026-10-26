<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$common_path = './_common.php';
if (!file_exists($common_path)) {
    die(json_encode(['success' => false, 'error' => "서버 에러: _common.php를 찾을 수 없습니다. 경로가 올바른지 확인해주세요. (확인된 상대경로: $common_path)"]));
}
include_once($common_path);
header('Content-Type: application/json; charset=utf-8');

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => '잘못된 요청입니다.']);
    exit;
}

// 1. DB 이력 저장 (UPSERT)
if ($is_member) {
    $mb_id = $member['mb_id'];
    $json_data = sql_real_escape_string($input);
    $sql = " INSERT INTO bjn_calc_history (mb_id, input_data, created_at, updated_at) 
             VALUES ('{$mb_id}', '{$json_data}', NOW(), NOW()) 
             ON DUPLICATE KEY UPDATE input_data = '{$json_data}', updated_at = NOW() ";
    sql_query($sql);
}

// --- 공통 상수 선언 ---
$MEDIAN_INCOME = [
    '1' => 2736042, '2' => 4480645, '3' => 5718091, '4' => 6929885, '5' => 8063019,
    '6' => 9129201, '7' => 10152665, '8' => 11176129, '9' => 12199593, '10' => 13223057
];

$THRESHOLDS = [
    '1' => ['livelihood' => 875533, 'medical' => 1094417, 'housing' => 1313300, 'education' => 1368021],
    '2' => ['livelihood' => 1433806, 'medical' => 1792258, 'housing' => 2150710, 'education' => 2240323],
    '3' => ['livelihood' => 1829789, 'medical' => 2287236, 'housing' => 2744684, 'education' => 2859046],
    '4' => ['livelihood' => 2217563, 'medical' => 2771954, 'housing' => 3326345, 'education' => 3464943],
    '5' => ['livelihood' => 2580166, 'medical' => 3225208, 'housing' => 3870249, 'education' => 4031510],
    '6' => ['livelihood' => 2921344, 'medical' => 3651680, 'housing' => 4382016, 'education' => 4564601],
    '7' => ['livelihood' => 3248853, 'medical' => 4061066, 'housing' => 4873279, 'education' => 5076333],
    '8' => ['livelihood' => 3576362, 'medical' => 4470452, 'housing' => 5364542, 'education' => 5588065],
    '9' => ['livelihood' => 3903871, 'medical' => 4879838, 'housing' => 5855805, 'education' => 6099797],
    '10' => ['livelihood' => 4231380, 'medical' => 5289224, 'housing' => 6347068, 'education' => 6611529]
];

$CHASANGWI_THRESHOLDS = [
    '1' => 1368021, '2' => 2240323, '3' => 2859046, '4' => 3464943, '5' => 4031510,
    '6' => 4564601, '7' => 5076333, '8' => 5588065, '9' => 6099797, '10' => 6611529
];

$HANBUMO_THRESHOLDS = [
    // 2027년 기준중위소득 66%
    '1' => 1805788, '2' => 2957226, '3' => 3773940, '4' => 4573724, '5' => 5321593,
    '6' => 6025273, '7' => 6700759, '8' => 7376245, '9' => 8051731, '10' => 8727218
];

$DEDUCTION_AMOUNTS = ['seoul' => 99000000, 'gyeonggi' => 80000000, 'metro' => 77000000, 'other' => 53000000];
$MEDICAL_DEDUCTION_AMOUNTS = ['seoul' => 135000000, 'gyeonggi' => 135000000, 'metro' => 135000000, 'other' => 85000000];
$RESIDENTIAL_PROPERTY_LIMITS = ['seoul' => 172000000, 'gyeonggi' => 151000000, 'metro' => 146000000, 'other' => 112000000];
$WORK_UNABLE_PROPERTY_LIMITS = ['seoul' => 143000000, 'gyeonggi' => 125000000, 'metro' => 120000000, 'other' => 91000000];
$WORK_UNABLE_FINANCIAL_LIMITS = ['seoul' => 54000000, 'gyeonggi' => 54000000, 'metro' => 54000000, 'other' => 34000000];

$FINANCIAL_ASSET_DEDUCTION = 5000000;

$STANDARD_RENT = [
    'seoul' => [
        '1' => 381000, '2' => 431000, '3' => 514000, '4' => 596000, '5' => 618000, '6' => 731000,
        '7' => 731000, '8' => 804000, '9' => 804000, '10' => 884000, '11' => 884000
    ],
    'gyeonggi' => [
        '1' => 313000, '2' => 352000, '3' => 422000, '4' => 488000, '5' => 505000, '6' => 599000,
        '7' => 599000, '8' => 658000, '9' => 658000, '10' => 723000, '11' => 723000
    ],
    'metro' => [
        '1' => 259000, '2' => 291000, '3' => 347000, '4' => 403000, '5' => 418000, '6' => 492000,
        '7' => 492000, '8' => 541000, '9' => 541000, '10' => 595000, '11' => 595000
    ],
    'other' => [
        '1' => 234000, '2' => 265000, '3' => 318000, '4' => 369000, '5' => 382000, '6' => 452000,
        '7' => 452000, '8' => 497000, '9' => 497000, '10' => 546000, '11' => 546000
    ]
];

function getMultiplier($unit) {
    return ($unit === 'manwon') ? 10000 : 1;
}

function calculateCommonIncome($data, $MEDIAN_INCOME, $isChasangwi = false, $forMedical = false) {
    $householdSize = $data['householdSize'] ?? '1';
    $medianIncome = $MEDIAN_INCOME[$householdSize] ?? 0;
    
    // 1-1. 근로/사업소득
    $evaluatedEarnedIncome = 0;
    foreach ($data['earnedIncomes'] as $income) {
        $grossIncome = floatval($income['amount']) * getMultiplier($income['amountUnit']);
        $pensionPaid = floatval($income['pension']) * getMultiplier($income['pensionUnit']);
        if ($grossIncome <= 0) continue;
        
        $baseDeduction = 0;
        $percentageRate = 0.3;
        
        switch ($income['type']) {
            case 'youth': $baseDeduction = 600000; break;
            case 'student': $baseDeduction = 600000; break;
            case 'senior': 
            case 'student_over_35':
            case 'disabled': $baseDeduction = 200000; break;
            case 'single_parent_youth': $baseDeduction = 600000; break;
            case 'disabled_rehab': $baseDeduction = 200000; $percentageRate = 0.5; break;
            default: 
                $baseDeduction = 0; 
                $percentageRate = $forMedical ? 0.0 : 0.3; 
                break;
        }

        $remainingIncome = max(0, $grossIncome - $baseDeduction);
        $percentageDeduction = $remainingIncome * $percentageRate;
        $incomeDeduction = $baseDeduction + $percentageDeduction;
        
        $cappedIncomeDeduction = min($grossIncome, $incomeDeduction);
        $incomeAfterEarnedDeduction = $grossIncome - $cappedIncomeDeduction;
        $pensionDeductionApplied = $pensionPaid * 0.75;
        
        $evaluatedEarnedIncome += max(0, $incomeAfterEarnedDeduction - $pensionDeductionApplied);
    }
    
    // 1-2. 사적 이전소득 (차상위계층확인/본인부담경감 에서는 반영 안함)
    $evaluatedPrivateTransferIncome = 0;
    if (!$isChasangwi) {
        $privateType = $data['privateTransferType'] ?? 'same';
        if ($privateType === 'same') {
            $monthlyInput = floatval($data['privateTransferIncome']) * getMultiplier($data['inputUnits']['privateTransferIncome']);
            $deductionVal = $medianIncome * 0.15;
            $evaluatedPrivateTransferIncome = max(0, $monthlyInput - $deductionVal);
        } else {
            $calculatedSum = 0;
            $validCount = 0;
            $monthlyInputs = [];
            for($i=0; $i<12; $i++) {
                $val = floatval($data['privateTransferTwelveMonths'][$i] ?? 0);
                $unit = $data['privateTransferTwelveMonthUnits'][$i] ?? 'manwon';
                $input = $val * getMultiplier($unit);
                if ($input > 0) $validCount++;
                $calculated = max(0, $input - ($medianIncome * 0.15));
                $calculatedSum += $calculated;
            }
            $isFrequent = $data['isFrequentPrivateTransfer'] || $validCount >= 6;
            if ($isFrequent) {
                $evaluatedPrivateTransferIncome = $calculatedSum / 12; // 정기
            } else {
                $threshold = $medianIncome * 0.5; // 비정기
                if ($calculatedSum > $threshold) {
                    $evaluatedPrivateTransferIncome = ($calculatedSum - $threshold) / 12;
                } else {
                    $evaluatedPrivateTransferIncome = 0;
                }
            }
        }
    }
    
    // 1-3. 공적 이전소득
    $evaluatedPublicTransferIncome = floatval($data['publicTransferIncome']) * getMultiplier($data['inputUnits']['publicTransferIncome']);
    
    // 1-4. 재산소득 (임대소득, 이자소득)
    $propertyRentalIncome = floatval($data['propertyRentalIncome'] ?? 0) * getMultiplier($data['inputUnits']['propertyRentalIncome'] ?? 'manwon');
    
    $propertyInterestInput = floatval($data['propertyInterestIncome'] ?? 0) * getMultiplier($data['inputUnits']['propertyInterestIncome'] ?? 'manwon');
    $interestMonths = intval($data['propertyInterestMonths'] ?? 12);
    
    if ($interestMonths <= 12) {
        $interestDeduction = 240000;
    } else {
        $interestDeduction = 20000 * $interestMonths;
    }
    $evaluatedInterestIncome = max(0, ($propertyInterestInput - $interestDeduction) / 12);
    
    $evaluatedPropertyIncome = $propertyRentalIncome + $evaluatedInterestIncome;
    
    // 1-5. 지출요인 공제
    $expenditureDeduction = floatval($data['expenditureDeduction'] ?? 0) * getMultiplier($data['inputUnits']['expenditureDeduction'] ?? 'manwon');
    
    $totalIncome = $evaluatedEarnedIncome + $evaluatedPrivateTransferIncome + $evaluatedPublicTransferIncome + $evaluatedPropertyIncome - $expenditureDeduction;
    
    return max(0, $totalIncome);
}

function calculateProperty($data, $basicDeductionAmount) {
    global $RESIDENTIAL_PROPERTY_LIMITS, $FINANCIAL_ASSET_DEDUCTION, $WORK_UNABLE_PROPERTY_LIMITS, $WORK_UNABLE_FINANCIAL_LIMITS;
    
    $region = $data['region'] ?? 'seoul';
    $housingType = $data['housingType'] ?? 'jeonse';
    
    $residentialRaw = floatval($data['residentialProperty']) * getMultiplier($data['inputUnits']['residentialProperty']);
    $adjustedResidential = ($housingType === 'jeonse') ? $residentialRaw * 0.95 : $residentialRaw;
    
    $generalRaw = floatval($data['generalProperty']) * getMultiplier($data['inputUnits']['generalProperty']);
    $automobileRaw = floatval($data['automobileProperty']) * getMultiplier($data['inputUnits']['automobileProperty']);
    $financialRaw = floatval($data['financialProperty']) * getMultiplier($data['inputUnits']['financialProperty']);
    $debtRaw = floatval($data['debt']) * getMultiplier($data['inputUnits']['debt']);
    
    // 면제 차량 로직
    $displacement = intval($data['automobileDisplacement']);
    if ($data['automobileDisabilityType'] === 'severe' && $displacement < 2000) {
        $automobileRaw = 0;
    }
    
    // 근로무능력자 특례 (재산특례여부 '예'인 경우)
    $isWorkUnablePropertyExempt = false;
    if (!empty($data['hasPropertyException']) && $data['hasPropertyException'] === true) {
        $propertyLimit = $WORK_UNABLE_PROPERTY_LIMITS[$region] ?? $WORK_UNABLE_PROPERTY_LIMITS['seoul'];
        $financialLimit = $WORK_UNABLE_FINANCIAL_LIMITS[$region] ?? $WORK_UNABLE_FINANCIAL_LIMITS['seoul'];
        $totalProperty = $adjustedResidential + $generalRaw + $automobileRaw + $financialRaw;
        $netProperty = max(0, $totalProperty - $debtRaw);
        $hasFullConversionAutomobile = false; // 현재 모든 자동차는 일반재산으로 평가되므로 100% 환산 자동차로 간주하지 않음
        if ($netProperty <= $propertyLimit && $financialRaw <= $financialLimit && !$hasFullConversionAutomobile) {
            $isWorkUnablePropertyExempt = true;
        }
    }
    
    if ($isWorkUnablePropertyExempt) {
        return [
            'residential' => 0,
            'general' => 0,
            'financial' => 0,
            'isWorkUnablePropertyExempt' => true
        ];
    }
    
    $residentialLimit = $RESIDENTIAL_PROPERTY_LIMITS[$region] ?? $RESIDENTIAL_PROPERTY_LIMITS['seoul'];
    $residentialForCalculation = min($adjustedResidential, $residentialLimit);
    $residentialExcess = max(0, $adjustedResidential - $residentialLimit);
    $totalGeneralProperty = $generalRaw + $automobileRaw + $residentialExcess;
    
    // 부채 전액을 먼저 주거용 → 일반 → 금융 재산에 배분합니다.
    $remainingDebt = $debtRaw;
    $residentialDebtUsed = min($residentialForCalculation, $remainingDebt);
    $remainingDebt -= $residentialDebtUsed;
    $generalDebtUsed = min($totalGeneralProperty, $remainingDebt);
    $remainingDebt -= $generalDebtUsed;
    $financialDebtUsed = min($financialRaw, $remainingDebt);
    $remainingDebt -= $financialDebtUsed;

    // 모든 재산의 부채 배분이 끝난 뒤 기본재산 공제를 배분합니다.
    $remainingBasicDeduction = $basicDeductionAmount;
    $residentialBasicUsed = min($residentialForCalculation - $residentialDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $residentialBasicUsed;
    $generalBasicUsed = min($totalGeneralProperty - $generalDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $generalBasicUsed;
    $financialBasicUsed = min($financialRaw - $financialDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $financialBasicUsed;

    $residentialDeduction = $residentialDebtUsed + $residentialBasicUsed;
    $generalDeduction = $generalDebtUsed + $generalBasicUsed;
    $financialDeduction = $financialDebtUsed + $financialBasicUsed;
    $residentialAfterDeduction = $residentialForCalculation - $residentialDeduction;
    $generalAfterDeduction = $totalGeneralProperty - $generalDeduction;
    $financialAfterBasicAndDebt = $financialRaw - $financialDeduction;
    $financialAfterDeduction = max(0, $financialAfterBasicAndDebt - $FINANCIAL_ASSET_DEDUCTION);
    
    return [
        'residential' => $residentialAfterDeduction,
        'general' => $generalAfterDeduction,
        'financial' => $financialAfterDeduction
    ];
}

// ---------------------------------------------
// 1. 기초생활보장 계산
// ---------------------------------------------
function calcGicho($data, $MEDIAN_INCOME, $THRESHOLDS, $DEDUCTION_AMOUNTS) {
    $income = calculateCommonIncome($data, $MEDIAN_INCOME, false, false);
    $incomeMedical = calculateCommonIncome($data, $MEDIAN_INCOME, false, true);
    $props = calculateProperty($data, $DEDUCTION_AMOUNTS[$data['region']]);
    
    $propConversion = ($props['residential'] * 0.0104) + ($props['general'] * 0.0417) + ($props['financial'] * 0.0626);
    $totalIncome = round($income + $propConversion);
    $totalIncomeMedical = round($incomeMedical + $propConversion);
    
    $size = $data['householdSize'];
    $th = $THRESHOLDS[$size] ?? $THRESHOLDS['6'];
    
    // 생계급여 예상 지급액 산출
    $livelihoodBenefitAmount = max(0, $th['livelihood'] - $totalIncome);
    if ($totalIncome > $th['livelihood']) {
        $livelihoodBenefitAmount = 0;
    }

    // 주거급여 예상 지급액 산출
    $housingBenefitAmount = 0;
    $housingType = $data['housingType'] ?? 'jeonse';
    if ($totalIncome <= $th['housing']) {
        if ($housingType === 'jeonse' || $housingType === 'wolse') {
            global $STANDARD_RENT;
            $region = $data['region'] ?? 'seoul';
            $standardRent = $STANDARD_RENT[$region][$size] ?? $STANDARD_RENT[$region]['6'] ?? 0;
            
            $rentDeposit = floatval($data['residentialProperty'] ?? 0) * getMultiplier($data['inputUnits']['residentialProperty'] ?? 'manwon');
            $monthlyRent = floatval($data['monthlyRent'] ?? 0) * getMultiplier($data['inputUnits']['monthlyRent'] ?? 'manwon');
            
            $actualRent = ($rentDeposit * 0.04 / 12) + $monthlyRent;
            $assistanceAmount = min($actualRent, $standardRent);
            
            if ($totalIncome > $th['livelihood']) {
                $selfBurden = ($totalIncome - $th['livelihood']) * 0.3;
                $housingBenefitAmount = max(0, $assistanceAmount - $selfBurden);
            } else {
                $housingBenefitAmount = $assistanceAmount;
            }
        } else if ($housingType === 'owned') {
            $housingBenefitAmount = -1; // -1 means 수선유지급여
        } else if ($housingType === 'free') {
            $housingBenefitAmount = 0; // 무료임차
        }
    }
    
    return [
        'income' => $totalIncome,
        'medicalIncome' => $totalIncomeMedical,
        'eligible' => $totalIncome <= $th['education'] || $totalIncomeMedical <= $th['medical'],
        'livelihoodEligible' => $totalIncome <= $th['livelihood'],
        'medicalEligible' => $totalIncomeMedical <= $th['medical'],
        'housingEligible' => $totalIncome <= $th['housing'],
        'educationEligible' => $totalIncome <= $th['education'],
        'thresholdLivelihood' => $th['livelihood'],
        'thresholdMedical' => $th['medical'],
        'thresholdHousing' => $th['housing'],
        'thresholdEducation' => $th['education'],
        'livelihoodBenefitAmount' => round($livelihoodBenefitAmount),
        'housingBenefitAmount' => round($housingBenefitAmount)
    ];
}

// ---------------------------------------------
// 2. 한부모가족지원 계산
// ---------------------------------------------
function calcHanbumo($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS, $HANBUMO_THRESHOLDS) {
    $income = calculateCommonIncome($data, $MEDIAN_INCOME, false);
    $props = calculateProperty($data, $DEDUCTION_AMOUNTS[$data['region']]);
    
    // 한부모가족지원 환산율
    $propConversion = ($props['residential'] * 0.0104) + ($props['general'] * 0.0417) + ($props['financial'] * 0.0626);
    $totalIncome = round($income + $propConversion);
    
    $size = $data['householdSize'];
    $threshold = $HANBUMO_THRESHOLDS[$size] ?? $HANBUMO_THRESHOLDS['6'];
    
    return [
        'income' => $totalIncome,
        'eligible' => $totalIncome <= $threshold,
        'threshold' => $threshold
    ];
}

// ---------------------------------------------
// 3. 차상위계층확인 계산
// ---------------------------------------------
function calcChasangwi($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS, $CHASANGWI_THRESHOLDS) {
    $income = calculateCommonIncome($data, $MEDIAN_INCOME, true); // 사적이전소득 제외
    $props = calculateProperty($data, $DEDUCTION_AMOUNTS[$data['region']]);
    
    $propConversion = ($props['residential'] * 0.0104) + ($props['general'] * 0.0417) + ($props['financial'] * 0.0417);
    $totalIncome = round($income + $propConversion);
    
    $size = $data['householdSize'];
    $threshold = $CHASANGWI_THRESHOLDS[$size] ?? $CHASANGWI_THRESHOLDS['6'];
    
    return [
        'income' => $totalIncome,
        'eligible' => $totalIncome <= $threshold,
        'threshold' => $threshold
    ];
}

// ---------------------------------------------
// 4. 차상위본인부담경감 계산
// ---------------------------------------------
function calcChasangwiMedical($data, $MEDIAN_INCOME, $MEDICAL_DEDUCTION_AMOUNTS, $CHASANGWI_THRESHOLDS) {
    $income = calculateCommonIncome($data, $MEDIAN_INCOME, true, true); // 사적이전소득 제외, 의료급여 공제 룰(일반공제 0%) 적용
    $props = calculateProperty($data, $MEDICAL_DEDUCTION_AMOUNTS[$data['region']]); // 오버라이드된 기본재산액 적용
    
    // 치명적 예외: 일반 재산 환산율 월 4.17% 적용 (기본 차상위는 금융 4.17%이나 본인부담경감은 금융 6.26% 적용)
    $propConversion = ($props['residential'] * 0.0104) + ($props['general'] * 0.0417) + ($props['financial'] * 0.0626);
    $totalIncome = round($income + $propConversion);
    
    $size = $data['householdSize'];
    $median = $MEDIAN_INCOME[$size] ?? 0;
    $threshold = $median * 0.50; // 기준 중위소득 50%
    
    return [
        'income' => $totalIncome,
        'eligible' => $totalIncome <= $threshold
    ];
}

// --- 상세 내역 계산 (프론트엔드 모달용) ---
function getCalculationDetails($data, $MEDIAN_INCOME, $basicDeductionAmount, $isChasangwi, $financialPropertyRateValue = 0.0626, $forMedical = false) {
    global $RESIDENTIAL_PROPERTY_LIMITS, $FINANCIAL_ASSET_DEDUCTION, $WORK_UNABLE_PROPERTY_LIMITS, $WORK_UNABLE_FINANCIAL_LIMITS;
    $householdSize = $data['householdSize'] ?? '1';
    $medianIncome = $MEDIAN_INCOME[$householdSize] ?? 0;
    
    // 소득
    $totalEarnedRaw = 0;
    $incomeDetails = [];
    $evaluatedEarnedIncome = 0;
    foreach ($data['earnedIncomes'] as $income) {
        $grossIncome = floatval($income['amount']) * getMultiplier($income['amountUnit']);
        $pensionPaid = floatval($income['pension']) * getMultiplier($income['pensionUnit']);
        if ($grossIncome <= 0) continue;
        
        $totalEarnedRaw += $grossIncome;
        $baseDeduction = 0;
        $percentageRate = 0.3;
        $deductionLabel = "기본 공제 (30%)";
        
        switch ($income['type']) {
            case 'youth': $baseDeduction = 600000; $deductionLabel = "청년 공제 (60만 + 30%)"; break;
            case 'student': $baseDeduction = 600000; $deductionLabel = "대학생 공제 (60만 + 30%)"; break;
            case 'senior': $baseDeduction = 200000; $deductionLabel = "노인 공제 (20만 + 30%)"; break;
            case 'student_over_35': $baseDeduction = 200000; $deductionLabel = "만 35세 이상 야간대학생 등 공제 (20만 + 30%)"; break;
            case 'disabled': $baseDeduction = 200000; $deductionLabel = "장애인 공제 (20만 + 30%)"; break;
            case 'single_parent_youth': $baseDeduction = 600000; $deductionLabel = "한부모/청년 공제 (60만 + 30%)"; break;
            case 'disabled_rehab': $baseDeduction = 200000; $percentageRate = 0.5; $deductionLabel = "장애인 직업재활 (20만 + 50%)"; break;
            default:
                if ($forMedical) {
                    $percentageRate = 0.0;
                    $deductionLabel = "공제 없음";
                }
                break;
        }

        $remainingIncome = max(0, $grossIncome - $baseDeduction);
        $percentageDeduction = $remainingIncome * $percentageRate;
        $incomeDeduction = $baseDeduction + $percentageDeduction;
        $cappedIncomeDeduction = min($grossIncome, $incomeDeduction);
        $pensionDeductionApplied = $pensionPaid * 0.75;
        
        $eval = max(0, ($grossIncome - $cappedIncomeDeduction) - $pensionDeductionApplied);
        $evaluatedEarnedIncome += $eval;
        
        $incomeDetails[] = [
            'raw' => $grossIncome,
            'deductionLabel' => $deductionLabel,
            'deduction' => $cappedIncomeDeduction,
            'baseDeduction' => min($grossIncome, $baseDeduction),
            'baseDeductionLimit' => $baseDeduction,
            'baseDeductionLabel' => [
                'youth' => '소득공제 (34세 이하 청년)',
                'student' => '소득공제 (대학생)',
                'senior' => '소득공제 (65세 이상)',
                'student_over_35' => '소득공제 (35세 이상 초·중·고등학생)',
                'disabled' => '소득공제 (등록장애인)',
                'single_parent_youth' => '소득공제 (한부모·청년)',
                'disabled_rehab' => '소득공제 (등록장애인·직업재활사업 참여 소득)'
            ][$income['type']] ?? '소득공제',
            'percentageDeduction' => $percentageDeduction,
            'percentageRate' => $percentageRate,
            'pensionDeduction' => $pensionDeductionApplied
        ];
    }
    
    // 사적이전소득 (차상위는 0 처리)
    $privateTransferTotalInput = 0;
    $privateTransferMonthlyDetails = [];
    $evaluatedPrivateTransferIncome = 0;
    if (!$isChasangwi) {
        $privateType = $data['privateTransferType'] ?? 'same';
        if ($privateType === 'same') {
            $monthlyInput = floatval($data['privateTransferIncome']) * getMultiplier($data['inputUnits']['privateTransferIncome']);
            $privateTransferTotalInput = $monthlyInput;
            $deductionVal = $medianIncome * 0.15;
            $evaluatedPrivateTransferIncome = max(0, $monthlyInput - $deductionVal);
            $privateTransferMonthlyDetails = array_fill(0, 12, [
                'input' => $monthlyInput,
                'deduction' => min($monthlyInput, $deductionVal),
                'evaluated' => $evaluatedPrivateTransferIncome
            ]);
        } else {
            $calculatedSum = 0;
            $validCount = 0;
            for($i=0; $i<12; $i++) {
                $val = floatval($data['privateTransferTwelveMonths'][$i] ?? 0);
                $unit = $data['privateTransferTwelveMonthUnits'][$i] ?? 'manwon';
                $input = $val * getMultiplier($unit);
                if ($input > 0) $validCount++;
                $privateTransferTotalInput += $input;
                $calculated = max(0, $input - ($medianIncome * 0.15));
                $calculatedSum += $calculated;
                $privateTransferMonthlyDetails[] = [
                    'input' => $input,
                    'deduction' => min($input, $medianIncome * 0.15),
                    'evaluated' => $calculated
                ];
            }
            $privateTransferTotalInput = $privateTransferTotalInput / 12; // 평균값
            $isFrequent = $data['isFrequentPrivateTransfer'] || $validCount >= 6;
            if ($isFrequent) {
                $evaluatedPrivateTransferIncome = $calculatedSum / 12;
            } else {
                $threshold = $medianIncome * 0.5;
                if ($calculatedSum > $threshold) {
                    $evaluatedPrivateTransferIncome = ($calculatedSum - $threshold) / 12;
                } else {
                    $evaluatedPrivateTransferIncome = 0;
                }
            }
        }
    }
    
    // 이전소득 및 공적 이전소득
    $evaluatedPublicTransferIncome = floatval($data['publicTransferIncome']) * getMultiplier($data['inputUnits']['publicTransferIncome']);
    
    // 재산소득 (임대소득, 이자소득)
    $propertyRentalIncome = floatval($data['propertyRentalIncome'] ?? 0) * getMultiplier($data['inputUnits']['propertyRentalIncome'] ?? 'manwon');
    
    $propertyInterestInput = floatval($data['propertyInterestIncome'] ?? 0) * getMultiplier($data['inputUnits']['propertyInterestIncome'] ?? 'manwon');
    $interestMonths = intval($data['propertyInterestMonths'] ?? 12);
    
    if ($interestMonths <= 12) {
        $interestDeduction = 240000;
    } else {
        $interestDeduction = 20000 * $interestMonths;
    }
    $evaluatedInterestIncome = max(0, ($propertyInterestInput - $interestDeduction) / 12);
    
    // 지출요인 공제
    $expenditureDeductionRaw = floatval($data['expenditureDeduction'] ?? 0) * getMultiplier($data['inputUnits']['expenditureDeduction'] ?? 'manwon');
    
    $totalIncomeEvaluationBeforeDeduction = $evaluatedEarnedIncome + $evaluatedPrivateTransferIncome + $evaluatedPublicTransferIncome + $propertyRentalIncome + $evaluatedInterestIncome;
    $totalIncomeEvaluation = max(0, $totalIncomeEvaluationBeforeDeduction - $expenditureDeductionRaw);
    
    // 재산
    $region = $data['region'] ?? 'seoul';
    $housingType = $data['housingType'] ?? 'jeonse';
    $residentialRaw = floatval($data['residentialProperty']) * getMultiplier($data['inputUnits']['residentialProperty']);
    $residentialPropertyRate = ($housingType === 'jeonse') ? 0.95 : 1.0;
    $adjustedResidential = $residentialRaw * $residentialPropertyRate;
    
    $generalRaw = floatval($data['generalProperty']) * getMultiplier($data['inputUnits']['generalProperty']);
    $automobileRaw = floatval($data['automobileProperty']) * getMultiplier($data['inputUnits']['automobileProperty']);
    $financialRaw = floatval($data['financialProperty']) * getMultiplier($data['inputUnits']['financialProperty']);
    $debtRaw = floatval($data['debt']) * getMultiplier($data['inputUnits']['debt']);
    
    $displacement = intval($data['automobileDisplacement']);
    if ($data['automobileDisabilityType'] === 'severe' && $displacement < 2000) {
        $automobileRaw = 0;
    }
    
    $residentialLimit = $RESIDENTIAL_PROPERTY_LIMITS[$region] ?? $RESIDENTIAL_PROPERTY_LIMITS['seoul'];
    $residentialForCalculation = min($adjustedResidential, $residentialLimit);
    $residentialExcess = max(0, $adjustedResidential - $residentialLimit);
    $totalGeneralProperty = $generalRaw + $automobileRaw + $residentialExcess;
    
    // 부채 전액을 먼저 주거용 → 일반 → 금융 재산에 배분합니다.
    $remainingDebt = $debtRaw;
    $residentialDebtUsed = min($residentialForCalculation, $remainingDebt);
    $remainingDebt -= $residentialDebtUsed;
    $generalDebtUsed = min($totalGeneralProperty, $remainingDebt);
    $remainingDebt -= $generalDebtUsed;
    $financialDebtUsed = min($financialRaw, $remainingDebt);
    $remainingDebt -= $financialDebtUsed;

    // 모든 재산의 부채 배분이 끝난 뒤 기본재산 공제를 배분합니다.
    $remainingBasicDeduction = $basicDeductionAmount;
    $residentialBasicUsed = min($residentialForCalculation - $residentialDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $residentialBasicUsed;
    $generalBasicUsed = min($totalGeneralProperty - $generalDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $generalBasicUsed;
    $financialBasicUsed = min($financialRaw - $financialDebtUsed, $remainingBasicDeduction);
    $remainingBasicDeduction -= $financialBasicUsed;

    $residentialDeduction = $residentialDebtUsed + $residentialBasicUsed;
    $generalDeduction = $generalDebtUsed + $generalBasicUsed;
    $financialDeduction = $financialDebtUsed + $financialBasicUsed;
    $residentialPropertyAfterDeduction = $residentialForCalculation - $residentialDeduction;
    $generalPropertyAfterDeduction = $totalGeneralProperty - $generalDeduction;
    $financialAfterBasicAndDebt = $financialRaw - $financialDeduction;
    $financialFixedDeductionAmount = min($financialAfterBasicAndDebt, $FINANCIAL_ASSET_DEDUCTION);
    $financialPropertyAfterDeduction = $financialAfterBasicAndDebt - $financialFixedDeductionAmount;
    
    $isWorkUnablePropertyExempt = false;
    $workUnablePropertyLimit = 0;
    $workUnableFinancialLimit = 0;
    $workUnableTotalProperty = 0;
    $workUnableNetProperty = 0;
    
    if (!empty($data['hasPropertyException']) && $data['hasPropertyException'] === true) {
        $workUnablePropertyLimit = $WORK_UNABLE_PROPERTY_LIMITS[$region] ?? $WORK_UNABLE_PROPERTY_LIMITS['seoul'];
        $workUnableFinancialLimit = $WORK_UNABLE_FINANCIAL_LIMITS[$region] ?? $WORK_UNABLE_FINANCIAL_LIMITS['seoul'];
        $workUnableTotalProperty = $adjustedResidential + $generalRaw + $automobileRaw + $financialRaw;
        $workUnableNetProperty = max(0, $workUnableTotalProperty - $debtRaw);
        $hasFullConversionAutomobile = false; // 현재 모든 자동차는 일반재산으로 평가되므로 100% 환산 자동차로 간주하지 않음
        if ($workUnableNetProperty <= $workUnablePropertyLimit && $financialRaw <= $workUnableFinancialLimit && !$hasFullConversionAutomobile) {
            $isWorkUnablePropertyExempt = true;
        }
    }
    
    if ($isWorkUnablePropertyExempt) {
        $residentialPropertyConversion = 0;
        $generalPropertyConversion = 0;
        $financialPropertyConversion = 0;
        $totalPropertyConversion = 0;
    } else {
        $residentialPropertyConversion = $residentialPropertyAfterDeduction * 0.0104;
        $generalPropertyConversion = $generalPropertyAfterDeduction * 0.0417;
        $financialPropertyConversion = $financialPropertyAfterDeduction * $financialPropertyRateValue;
        $totalPropertyConversion = $residentialPropertyConversion + $generalPropertyConversion + $financialPropertyConversion;
    }
    
    return [
        'totalEarnedRaw' => $totalEarnedRaw,
        'incomeDetails' => $incomeDetails,
        'evaluatedEarnedIncome' => $evaluatedEarnedIncome,
        'privateTransferTotalInput' => $privateTransferTotalInput,
        'privateTransferMedianIncome' => $medianIncome,
        'privateTransferMonthlyDetails' => $privateTransferMonthlyDetails,
        'privateTransferDeductionPerMonth' => $isChasangwi ? 0 : $medianIncome * 0.15,
        'privateTransferAnnualThreshold' => isset($isFrequent) && !$isFrequent ? $medianIncome * 0.5 : 0,
        'privateTransferAfterMonthlyDeduction' => $calculatedSum ?? $evaluatedPrivateTransferIncome,
        'evaluatedPrivateTransferIncome' => $evaluatedPrivateTransferIncome,
        'evaluatedPublicTransferIncome' => $evaluatedPublicTransferIncome,
        'evaluatedRentalIncome' => $propertyRentalIncome,
        'evaluatedInterestIncome' => $evaluatedInterestIncome,
        'interestDeduction' => $interestDeduction,
        'expenditureDeductionRaw' => $expenditureDeductionRaw,
        'totalIncomeEvaluation' => $totalIncomeEvaluation,
        'residentialPropertyRaw' => $residentialRaw,
        'residentialPropertyRate' => $residentialPropertyRate,
        'generalPropertyRaw' => $generalRaw,
        'automobilePropertyRaw' => $automobileRaw,
        'financialPropertyRaw' => $financialRaw,
        'debtRaw' => $debtRaw,
        'residentialPropertyAfterDeduction' => $residentialPropertyAfterDeduction,
        'generalPropertyAfterDeduction' => $generalPropertyAfterDeduction,
        'financialPropertyAfterDeduction' => $financialPropertyAfterDeduction,
        'residentialPropertyConversion' => $residentialPropertyConversion,
        'generalPropertyConversion' => $generalPropertyConversion,
        'financialPropertyConversion' => $financialPropertyConversion,
        'totalPropertyConversion' => $totalPropertyConversion,
        'isWorkUnablePropertyExempt' => $isWorkUnablePropertyExempt,
        'workUnableNetProperty' => $workUnableNetProperty,
        'workUnableResidentialProperty' => $adjustedResidential,
        'workUnableGeneralProperty' => $generalRaw + $automobileRaw,
        'workUnableFinancialProperty' => $financialRaw,
        'workUnableDebt' => $debtRaw,
        'workUnablePropertyLimit' => $workUnablePropertyLimit,
        'workUnableFinancialLimit' => $workUnableFinancialLimit,
        'residentialPropertyLimit' => $residentialLimit,
        'residentialExcess' => $residentialExcess,
        'residentialPropertyForCalc' => $residentialForCalculation,
        'residentialPropertyDeduction' => $residentialDeduction,
        'residentialBasicDedUsed' => $residentialBasicUsed,
        'residentialDebtUsed' => $residentialDebtUsed,
        'totalGeneralProperty' => $totalGeneralProperty,
        'generalPropertyDeduction' => $generalDeduction,
        'generalBasicDedUsed' => $generalBasicUsed,
        'generalDebtUsed' => $generalDebtUsed,
        'financialFixedDeductionAmount' => $financialFixedDeductionAmount,
        'financialRemainingDeductionAmount' => $financialDeduction,
        'financialBasicDedUsed' => $financialBasicUsed,
        'financialDebtUsed' => $financialDebtUsed,
        'basicPropertyDeduction' => $basicDeductionAmount,
        'financialPropertyRateValue' => $financialPropertyRateValue
    ];
}

// --- 최종 응답 패키징 ---
$gicho = calcGicho($data, $MEDIAN_INCOME, $THRESHOLDS, $DEDUCTION_AMOUNTS);
$gicho['details'] = getCalculationDetails($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS[$data['region']], false, 0.0626);
$gicho['medicalDetails'] = getCalculationDetails($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS[$data['region']], false, 0.0626, true);

$hanbumo = calcHanbumo($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS, $HANBUMO_THRESHOLDS);
$hanbumo['details'] = getCalculationDetails($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS[$data['region']], false, 0.0626);

$chasangwi = calcChasangwi($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS, $CHASANGWI_THRESHOLDS);
$chasangwi['details'] = getCalculationDetails($data, $MEDIAN_INCOME, $DEDUCTION_AMOUNTS[$data['region']], true, 0.0417);

$chasangwiMedical = calcChasangwiMedical($data, $MEDIAN_INCOME, $MEDICAL_DEDUCTION_AMOUNTS, $CHASANGWI_THRESHOLDS);
$chasangwiMedical['details'] = getCalculationDetails($data, $MEDIAN_INCOME, $MEDICAL_DEDUCTION_AMOUNTS[$data['region']], true, 0.0626, true);

echo json_encode([
    'success' => true,
    'data' => [
        'gicho' => $gicho,
        'hanbumo' => $hanbumo,
        'chasangwi' => $chasangwi,
        'chasangwiMedical' => $chasangwiMedical,
        'finalAmounts' => [
            'gicho' => $gicho['income'],
            'hanbumo' => $hanbumo['income'],
            'chasangwi' => $chasangwi['income'],
            'chasangwiMedical' => $chasangwiMedical['income']
        ]
    ]
]);
?>
