<?php
include_once('./_common.php');
header('Content-Type: application/json; charset=utf-8');

if (!$is_member) {
    echo json_encode(['success' => false, 'error' => '로그인이 필요합니다.']);
    exit;
}

$mb_id = $member['mb_id'];

// DB에서 해당 회원의 최신 모의계산 기록 조회
$sql = " SELECT input_data FROM bjn_calc_history WHERE mb_id = '{$mb_id}' ";
$row = sql_fetch($sql);

if ($row && $row['input_data']) {
    $input_data = json_decode($row['input_data'], true);
    echo json_encode(['success' => true, 'input_data' => $input_data]);
} else {
    echo json_encode(['success' => true, 'input_data' => null]);
}
?>
