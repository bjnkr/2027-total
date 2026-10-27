<?php
// Normalize old saved forms and validate requests before any calculation or DB write.
function normalizeCalculationInput($input) {
    if (!is_array($input) || !$input || array_is_list($input)) {
        throw new InvalidArgumentException('입력정보를 확인해 주세요.');
    }
    $numericFields = ['privateTransferIncome', 'publicTransferIncome', 'propertyRentalIncome', 'propertyInterestIncome',
        'propertyInterestMonths', 'expenditureDeduction', 'automobileDisplacement', 'automobileProperty',
        'automobileSeats', 'monthlyRent', 'residentialProperty', 'generalProperty', 'financialProperty', 'debt'];
    $defaults = array_fill_keys($numericFields, '');
    $defaults += ['householdSize' => '1', 'region' => 'seoul', 'housingType' => 'jeonse',
        'privateTransferType' => 'same', 'automobileDisabilityType' => 'none', 'automobileRegistrationDate' => ''];
    $data = array_replace($defaults, $input);
    $choices = ['householdSize' => array_map('strval', range(1, 10)), 'region' => ['seoul', 'gyeonggi', 'metro', 'other'],
        'housingType' => ['jeonse', 'wolse', 'owned', 'free'], 'privateTransferType' => ['same', 'different'],
        'automobileDisabilityType' => ['none', 'severe', 'mild']];
    foreach ($choices as $field => $values) {
        if (!is_scalar($data[$field]) || !in_array((string)$data[$field], $values, true)) {
            throw new InvalidArgumentException('선택한 입력 항목을 확인해 주세요: '.$field);
        }
        $data[$field] = (string)$data[$field];
    }
    $number = function ($value) {
        if (!is_string($value) && !is_int($value) && !is_float($value)) {
            throw new InvalidArgumentException('금액과 기간은 숫자로 입력해 주세요.');
        }
        $value = str_replace(',', '', trim((string)$value));
        if ($value !== '' && (!preg_match('/^\d+(?:\.\d+)?$/D', $value) || !is_finite((float)$value))) {
            throw new InvalidArgumentException('금액과 기간은 0 이상의 숫자로 입력해 주세요.');
        }
        return $value;
    };
    foreach ($numericFields as $field) $data[$field] = $number($data[$field]);
    foreach (['hasPropertyException', 'isSingleParent', 'isFrequentPrivateTransfer', 'isMultiChildHousehold'] as $field) {
        $value = $input[$field] ?? false;
        if (!in_array($value, [true, false, 'true', 'false', 1, 0, '1', '0'], true)) {
            throw new InvalidArgumentException('선택 여부를 확인해 주세요: '.$field);
        }
        $data[$field] = in_array($value, [true, 'true', 1, '1'], true);
    }
    $unit = function ($value) {
        if (!in_array($value, ['won', 'manwon'], true)) throw new InvalidArgumentException('금액 단위를 확인해 주세요.');
        return $value;
    };
    $unitFields = ['privateTransferIncome', 'publicTransferIncome', 'propertyRentalIncome', 'propertyInterestIncome',
        'expenditureDeduction', 'monthlyRent', 'residentialProperty', 'generalProperty', 'automobileProperty', 'financialProperty', 'debt'];
    if (isset($input['inputUnits']) && !is_array($input['inputUnits'])) throw new InvalidArgumentException('금액 단위를 확인해 주세요.');
    $data['inputUnits'] = [];
    foreach ($unitFields as $field) $data['inputUnits'][$field] = $unit($input['inputUnits'][$field] ?? 'manwon');
    $incomes = $input['earnedIncomes'] ?? [];
    if (!is_array($incomes) || !array_is_list($incomes)) throw new InvalidArgumentException('근로·사업소득 입력을 확인해 주세요.');
    $data['earnedIncomes'] = [];
    foreach ($incomes as $income) {
        if (!is_array($income)) throw new InvalidArgumentException('근로·사업소득 입력을 확인해 주세요.');
        $type = $income['type'] ?? 'general';
        if (!in_array($type, ['general', 'youth', 'student', 'senior', 'student_over_35', 'disabled', 'single_parent_youth', 'disabled_rehab'], true)) {
            throw new InvalidArgumentException('근로소득 공제 유형을 확인해 주세요.');
        }
        $data['earnedIncomes'][] = array_replace($income, ['amount' => $number($income['amount'] ?? ''),
            'pension' => $number($income['pension'] ?? ''), 'type' => $type,
            'amountUnit' => $unit($income['amountUnit'] ?? 'manwon'), 'pensionUnit' => $unit($income['pensionUnit'] ?? 'manwon')]);
    }
    foreach (['privateTransferTwelveMonths', 'privateTransferTwelveMonthUnits'] as $field) {
        if (isset($input[$field]) && (!is_array($input[$field]) || !array_is_list($input[$field]) || count($input[$field]) > 12)) {
            throw new InvalidArgumentException('월별 사적이전소득 입력을 확인해 주세요.');
        }
    }
    $data['privateTransferTwelveMonths'] = $data['privateTransferTwelveMonthUnits'] = [];
    for ($i = 0; $i < 12; $i++) {
        $data['privateTransferTwelveMonths'][] = $number($input['privateTransferTwelveMonths'][$i] ?? '');
        $data['privateTransferTwelveMonthUnits'][] = $unit($input['privateTransferTwelveMonthUnits'][$i] ?? 'manwon');
    }
    return $data;
}
