<?php
$g5_path = dirname(__DIR__, 3);
$common_file = $g5_path.'/common.php';

if (file_exists($common_file)) {
    include_once($common_file);
} else {
    $is_member = false;
    $member = [];

    if (!function_exists('sql_real_escape_string')) {
        function sql_real_escape_string($value) {
            return addslashes($value);
        }
    }

    if (!function_exists('sql_query')) {
        function sql_query($sql) {
            return false;
        }
    }
}
?>
