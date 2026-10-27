<?php
// 그누보드 공통 파일 인클루드 (경로는 실제 위치에 맞게 조정 필요)
include_once(__DIR__.'/api/_common.php');

// 관리자 권한 체크 (안전장치: 최고관리자만 실행 가능)
if (($is_admin ?? '') !== 'super') {
    die('최고관리자로 로그인한 후 실행해 주세요.');
}

// 생성할 테이블 SQL 쿼리
$sql = file_get_contents(__DIR__.'/api/create_table.sql');

// 그누보드 내장 함수를 이용해 쿼리 실행
$result = sql_query($sql, false);

// 결과 출력
if ($result) {
    echo "<h1>🎉 테이블 생성 완료!</h1>";
    echo "<p>bjn_calc_history 테이블이 성공적으로 만들어졌습니다.</p>";
    echo "<p style='color:red;'><b>보안을 위해 서버에서 이 파일(setup_table.php)을 반드시 삭제해 주세요!</b></p>";
} else {
    echo "<h1>❌ 테이블 생성 실패</h1>";
    echo "<p>에러가 발생했습니다. 이미 테이블이 존재하거나 권한 문제일 수 있습니다.</p>";
}
?>
