<?php
$g5_path = '../../..'; // 기본 스킨 경로 (skin/board/스킨명)
if (file_exists('../../../../../common.php')) {
    $g5_path = '../../../../..'; // 테마 스킨 경로 (theme/테마명/skin/board/스킨명)
} else if (file_exists('../../../../../../common.php')) {
    $g5_path = '../../../../../..'; // 모바일 테마 등 더 깊은 경우
}

include_once($g5_path.'/common.php');

header('Content-Type: application/json; charset=utf-8');

$w = isset($_POST['w']) ? trim($_POST['w']) : '';
$bo_table = isset($_POST['bo_table']) ? trim($_POST['bo_table']) : '';
$wr_id = isset($_POST['wr_id']) ? trim($_POST['wr_id']) : 0;
$wr_password = isset($_POST['wr_password']) ? trim($_POST['wr_password']) : '';

if (!$bo_table || !$wr_id || !$wr_password) {
    echo json_encode(['success' => false, 'msg' => '잘못된 접근입니다.']);
    exit;
}

$write = sql_fetch("select * from {$g5['write_prefix']}{$bo_table} where wr_id = '{$wr_id}'");

if (!$write['wr_id']) {
    echo json_encode(['success' => false, 'msg' => '글이 존재하지 않습니다.']);
    exit;
}

// 비밀번호 확인 로직 (그누보드 기본 함수 사용)
if (!check_password($wr_password, $write['wr_password'])) {
    echo json_encode(['success' => false, 'msg' => '비밀번호가 일치하지 않습니다.']);
    exit;
}

// 비밀번호가 맞으면 세션 설정
if ($w == 's') {
    // 조회용 세션
    set_session("ss_secret_{$bo_table}_{$wr_id}", TRUE);
} else if ($w == 'u') {
    // 수정용 세션 (그누보드는 ss_edit 세션을 검사함)
    set_session("ss_secret_{$bo_table}_{$wr_id}", TRUE);
    set_session("ss_edit_{$bo_table}_{$wr_id}", TRUE);
} else if ($w == 'd') {
    // 삭제용
    set_session("ss_secret_{$bo_table}_{$wr_id}", TRUE);
    set_session("ss_delete_{$bo_table}_{$wr_id}", TRUE);
}

echo json_encode(['success' => true]);
?>
