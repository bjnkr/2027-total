<?php
if (!defined('_GNUBOARD_')) exit; // 개별 페이지 접근 불가

// 선택옵션으로 인해 셀합치기가 가변적으로 변함
$colspan = 4;

if ($is_checkbox) $colspan++;
if ($is_good) $colspan++;
if ($is_nogood) $colspan++;

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$board_skin_url.'/style.css?ver='.time().'">', 0);
?>

<!-- 게시판 목록 시작 { -->

<div id="bo_list" style="width:<?php echo $width; ?>">

    <!-- 게시판 카테고리 시작 { -->
    <?php if ($is_category) { ?>
    <nav id="bo_cate">
        <h2><?php echo $board['bo_subject'] ?> 카테고리</h2>
        <ul id="bo_cate_ul">
            <?php echo $category_option ?>
        </ul>
    </nav>
    <?php } ?>
    <!-- } 게시판 카테고리 끝 -->
    
    <form name="fboardlist" id="fboardlist" action="<?php echo G5_BBS_URL; ?>/board_list_update.php" onsubmit="return fboardlist_submit(this);" method="post">
    
    <input type="hidden" name="bo_table" value="<?php echo $bo_table ?>">
    <input type="hidden" name="sfl" value="<?php echo $sfl ?>">
    <input type="hidden" name="stx" value="<?php echo $stx ?>">
    <input type="hidden" name="spt" value="<?php echo $spt ?>">
    <input type="hidden" name="sca" value="<?php echo $sca ?>">
    <input type="hidden" name="sst" value="<?php echo $sst ?>">
    <input type="hidden" name="sod" value="<?php echo $sod ?>">
    <input type="hidden" name="page" value="<?php echo $page ?>">
    <input type="hidden" name="sw" value="">

    <!-- 게시판 페이지 정보 및 버튼 시작 { -->
    <div id="bo_btn_top">
        <div id="bo_list_total">
            <span>Total <?php echo number_format($total_count) ?>건</span>
            <?php echo $page ?> 페이지
        </div>

        <ul class="btn_bo_user">
        	<?php if ($admin_href) { ?><li><a href="<?php echo $admin_href ?>" class="btn_admin btn" title="관리자"><i class="fa fa-cog fa-spin fa-fw"></i><span class="sound_only">관리자</span></a></li><?php } ?>
            <?php if ($rss_href) { ?><li><a href="<?php echo $rss_href ?>" class="btn_b01 btn" title="RSS"><i class="fa fa-rss" aria-hidden="true"></i><span class="sound_only">RSS</span></a></li><?php } ?>
            <li>
            	<button type="button" class="btn_bo_sch btn_b01 btn" title="게시판 검색"><i class="fa fa-search" aria-hidden="true"></i><span class="sound_only">게시판 검색</span></button>
            </li>
            <?php if ($list_href) { ?><li><a href="<?php echo $list_href ?>" class="btn_b01 btn" title="전체목록"><i class="fa fa-list" aria-hidden="true"></i><span class="sound_only">전체목록</span></a></li><?php } ?>
            <?php if ($write_href) { ?><li><a href="<?php echo $write_href ?>" class="btn_b01 btn" title="글쓰기"><i class="fa fa-pencil" aria-hidden="true"></i><span class="sound_only">글쓰기</span></a></li><?php } ?>
        	<?php if ($is_admin == 'super' || $is_auth) {  ?>
        	<li>
        		<button type="button" class="btn_more_opt is_list_btn btn_b01 btn" title="게시판 리스트 옵션"><i class="fa fa-ellipsis-v" aria-hidden="true"></i><span class="sound_only">게시판 리스트 옵션</span></button>
        		<?php if ($is_checkbox) { ?>	
		        <ul class="more_opt is_list_btn">  
		            <li><button type="submit" name="btn_submit" value="선택삭제" onclick="document.pressed=this.value"><i class="fa fa-trash-o" aria-hidden="true"></i> 선택삭제</button></li>
		            <li><button type="submit" name="btn_submit" value="선택복사" onclick="document.pressed=this.value"><i class="fa fa-files-o" aria-hidden="true"></i> 선택복사</button></li>
		            <li><button type="submit" name="btn_submit" value="선택이동" onclick="document.pressed=this.value"><i class="fa fa-arrows" aria-hidden="true"></i> 선택이동</button></li>
		        </ul>
		        <?php } ?>
        	</li>
        	<?php }  ?>
        </ul>
    </div>
    <!-- } 게시판 페이지 정보 및 버튼 끝 -->
        	
    <div class="tbl_head01 tbl_wrap">
        <table>
        <caption><?php echo $board['bo_subject'] ?> 목록</caption>
        <thead>
        <tr>
            <?php if ($is_checkbox) { ?>
            <th scope="col" class="all_chk chk_box">
            	<input type="checkbox" id="chkall" onclick="if (this.checked) all_checked(true); else all_checked(false);" class="selec_chk">
                <label for="chkall">
                	<span></span>
                	<b class="sound_only">현재 페이지 게시물  전체선택</b>
				</label>
            </th>
            <?php } ?>
            <th scope="col">번호</th>
            <th scope="col">제목</th>
            <th scope="col">글쓴이</th>

            <?php if ($is_good) { ?><th scope="col"><?php echo subject_sort_link('wr_good', $qstr2, 1) ?>추천 </a></th><?php } ?>
            <?php if ($is_nogood) { ?><th scope="col"><?php echo subject_sort_link('wr_nogood', $qstr2, 1) ?>비추천 </a></th><?php } ?>
            <th scope="col"><?php echo subject_sort_link('wr_datetime', $qstr2, 1) ?>날짜  </a></th>
        </tr>
        </thead>
        <tbody>
        <?php
        for ($i=0; $i<count($list); $i++) {
        	if ($i%2==0) $lt_class = "even";
        	else $lt_class = "";
		?>
        <tr class="<?php if ($list[$i]['is_notice']) echo "bo_notice"; ?> <?php echo $lt_class ?>">
            <?php if ($is_checkbox) { ?>
            <td class="td_chk chk_box">
				<input type="checkbox" name="chk_wr_id[]" value="<?php echo $list[$i]['wr_id'] ?>" id="chk_wr_id_<?php echo $i ?>" class="selec_chk">
            	<label for="chk_wr_id_<?php echo $i ?>">
            		<span></span>
            		<b class="sound_only"><?php echo $list[$i]['subject'] ?></b>
            	</label>
            </td>
            <?php } ?>
            <td class="td_num2">
            <?php
            if ($list[$i]['is_notice']) // 공지사항
                echo '<strong class="notice_icon">공지</strong>';
            else if ($wr_id == $list[$i]['wr_id'])
                echo "<span class=\"bo_current\">열람중</span>";
            else
                echo $list[$i]['num'];
             ?>
            </td>

            <td class="td_subject" style="padding-left:<?php echo $list[$i]['reply'] ? (strlen($list[$i]['wr_reply'])*10) : '0'; ?>px">
                <?php
                if ($is_category && $list[$i]['ca_name']) {
				?>
                <a href="<?php echo $list[$i]['ca_name_href'] ?>" class="bo_cate_link"><?php echo $list[$i]['ca_name'] ?></a>
                <?php } ?>
                <div class="bo_tit">
<?php
$is_secret = strstr($list[$i]['wr_option'], 'secret');
$is_auth = false;

// 관리자이거나, 작성자 본인(회원)인 경우 권한 있음
if ($is_admin || ($member['mb_id'] && $member['mb_id'] === $list[$i]['mb_id'])) {
    $is_auth = true;
} else if (get_session("ss_secret_{$bo_table}_{$list[$i]['wr_id']}")) {
    // 세션이 있는 경우 권한 있음
    $is_auth = true;
}

$needs_password = $is_secret && !$is_auth;

// 그누보드 get_list() 함수가 비밀글 본문을 강제로 지우는 것을 복구 (권한이 확인된 경우)
if ($is_secret && $is_auth) {
    $secret_row = sql_fetch("select wr_content from {$write_table} where wr_id = '{$list[$i]['wr_id']}'");
    $list[$i]['wr_content'] = $secret_row['wr_content'];
}
?>
                    <a href="<?php echo $list[$i]['href'] ?>">
                        <?php echo $list[$i]['icon_reply'] ?>
                        <?php
                            if (strstr($list[$i]['wr_option'], 'secret')) {
                                echo '<span style="color: #ef4444; margin-right: 6px; display: inline-flex; align-items: center; vertical-align: middle;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>';
                            }
                         ?>
                        <?php echo $list[$i]['subject'] ?>
                    </a>
                    <?php
                    if ($list[$i]['icon_new']) echo "<span class=\"new_icon\">N<span class=\"sound_only\">새글</span></span>";
                    // if ($list[$i]['file']['count']) { echo '<'.$list[$i]['file']['count'].'>'; }
                    if (isset($list[$i]['icon_hot'])) echo rtrim($list[$i]['icon_hot']);
                    if (isset($list[$i]['icon_file'])) echo rtrim($list[$i]['icon_file']);
                    if (isset($list[$i]['icon_link'])) echo rtrim($list[$i]['icon_link']);
                    ?>
                    <?php if ($list[$i]['comment_cnt']) { ?><span class="sound_only">답변</span><span class="cnt_cmt"><?php echo $list[$i]['wr_comment']; ?></span><span class="sound_only">개</span><?php } ?>
                </div>
            </td>
            <td class="td_name sv_use"><?php echo $list[$i]['name'] ?></td>

            <?php if ($is_good) { ?><td class="td_num"><?php echo $list[$i]['wr_good'] ?></td><?php } ?>
            <?php if ($is_nogood) { ?><td class="td_num"><?php echo $list[$i]['wr_nogood'] ?></td><?php } ?>
            <td class="td_datetime"><?php echo $list[$i]['datetime2'] ?></td>

        </tr>

        <?php } ?>
        <?php if (count($list) == 0) { echo '<tr><td colspan="'.$colspan.'" class="empty_table">게시물이 없습니다.</td></tr>'; } ?>
        </tbody>
        </table>
    </div>
	<!-- 페이지 -->
	<?php echo $write_pages; ?>
	<!-- 페이지 -->
	
    <?php if ($list_href || $is_checkbox || $write_href) { ?>
    <div class="bo_fx">
        <?php if ($list_href || $write_href) { ?>
        <ul class="btn_bo_user">
        	<?php if ($admin_href) { ?><li><a href="<?php echo $admin_href ?>" class="btn_admin btn" title="관리자"><i class="fa fa-cog fa-spin fa-fw"></i><span class="sound_only">관리자</span></a></li><?php } ?>
            <?php if ($rss_href) { ?><li><a href="<?php echo $rss_href ?>" class="btn_b01 btn" title="RSS"><i class="fa fa-rss" aria-hidden="true"></i><span class="sound_only">RSS</span></a></li><?php } ?>
            <?php if ($list_href) { ?><li><a href="<?php echo $list_href ?>" class="btn_b01 btn" title="전체목록"><i class="fa fa-list" aria-hidden="true"></i><span class="sound_only">전체목록</span></a></li><?php } ?>
            <?php if ($write_href) { ?><li><a href="<?php echo $write_href ?>" class="btn_b01 btn" title="글쓰기"><i class="fa fa-pencil" aria-hidden="true"></i><span class="sound_only">글쓰기</span></a></li><?php } ?>
        </ul>	
        <?php } ?>
    </div>
    <?php } ?>   
    </form>

    <!-- 게시판 검색 시작 { -->
    <div class="bo_sch_wrap">
        <fieldset class="bo_sch">
            <h3>검색</h3>
            <form name="fsearch" method="get">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table ?>">
            <input type="hidden" name="sca" value="<?php echo $sca ?>">
            <input type="hidden" name="sop" value="and">
            <input type="hidden" name="sfl" value="wr_subject||wr_content">
            <label for="stx" class="sound_only">검색어<strong class="sound_only"> 필수</strong></label>
            <div class="sch_bar">
                <input type="text" name="stx" value="<?php echo stripslashes($stx) ?>" required id="stx" class="sch_input" size="25" maxlength="20" placeholder=" 검색어를 입력해주세요">
                <button type="submit" value="검색" class="sch_btn"><i class="fa fa-search" aria-hidden="true"></i><span class="sound_only">검색</span></button>
            </div>
            <button type="button" class="bo_sch_cls" title="닫기"><i class="fa fa-times" aria-hidden="true"></i><span class="sound_only">닫기</span></button>
            </form>
        </fieldset>
        <div class="bo_sch_bg"></div>
    </div>
    <script>
    jQuery(function($){
        // 게시판 검색
        $(".btn_bo_sch").on("click", function() {
            $(".bo_sch_wrap").toggle();
        })
        $('.bo_sch_bg, .bo_sch_cls').click(function(){
            $('.bo_sch_wrap').hide();
        });
    });
    </script>
    <!-- } 게시판 검색 끝 --> 
</div>

<?php if($is_checkbox) { ?>
<noscript>
<p>자바스크립트를 사용하지 않는 경우<br>별도의 확인 절차 없이 바로 선택삭제 처리하므로 주의하시기 바랍니다.</p>
</noscript>
<?php } ?>

<?php if ($is_checkbox) { ?>
<script>
function all_checked(sw) {
    var f = document.fboardlist;

    for (var i=0; i<f.length; i++) {
        if (f.elements[i].name == "chk_wr_id[]")
            f.elements[i].checked = sw;
    }
}

function fboardlist_submit(f) {
    var chk_count = 0;

    for (var i=0; i<f.length; i++) {
        if (f.elements[i].name == "chk_wr_id[]" && f.elements[i].checked)
            chk_count++;
    }

    if (!chk_count) {
        alert(document.pressed + "할 게시물을 하나 이상 선택하세요.");
        return false;
    }

    if(document.pressed == "선택복사") {
        select_copy("copy");
        return;
    }

    if(document.pressed == "선택이동") {
        select_copy("move");
        return;
    }

    if(document.pressed == "선택삭제") {
        if (!confirm("선택한 게시물을 정말 삭제하시겠습니까?\n\n한번 삭제한 자료는 복구할 수 없습니다\n\n답변글이 있는 게시글을 선택하신 경우\n답변글도 선택하셔야 게시글이 삭제됩니다."))
            return false;

        f.removeAttribute("target");
        f.action = g5_bbs_url+"/board_list_update.php";
    }

    return true;
}

// 선택한 게시물 복사 및 이동
function select_copy(sw) {
    var f = document.fboardlist;

    if (sw == "copy")
        str = "복사";
    else
        str = "이동";

    var sub_win = window.open("", "move", "left=50, top=50, width=500, height=550, scrollbars=1");

    f.sw.value = sw;
    f.target = "move";
    f.action = g5_bbs_url+"/move.php";
    f.submit();
}

// 게시판 리스트 관리자 옵션
jQuery(function($){
    $(".btn_more_opt.is_list_btn").on("click", function(e) {
        e.stopPropagation();
        $(".more_opt.is_list_btn").toggle();
    });
    $(document).on("click", function (e) {
        if(!$(e.target).closest('.is_list_btn').length) {
            $(".more_opt.is_list_btn").hide();
        }
    });
});
</script>
<?php } ?>
<!-- } 게시판 목록 끝 -->

<?php
// delete.php 통과를 위한 전용 삭제 토큰 발급 및 세션 저장
$custom_delete_token = md5(uniqid(rand(), true));
set_session('ss_delete_token', $custom_delete_token);
?>
<!-- 비밀번호 확인 팝업 모달 -->
<div id="qna_password_modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(2px);">
    <div style="background:#fff; padding:30px; border-radius:12px; width:90%; max-width:400px; text-align:center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
        <h3 style="margin:0 0 15px 0; color:#1e293b; font-size:20px; font-weight:700;">비밀번호 확인</h3>
        <p style="color:#64748b; font-size:14px; margin-bottom:20px; line-height:1.5;">비밀글은 작성자와 관리자만 열람할 수 있어요.<br>작성 시 입력한 비밀번호를 입력해주세요.</p>
        <form onsubmit="submit_password_modal(this); return false;">
            <input type="hidden" name="w" id="modal_w" value="s">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table ?>">
            <input type="hidden" name="wr_id" id="modal_wr_id" value="">
            <input type="hidden" name="token" value="<?php echo $custom_delete_token; ?>">
            <input type="hidden" id="modal_list_index" value="">
            <input type="password" name="wr_password" id="modal_wr_password" required style="width:100%; height:48px; border:1px solid #e2e8f0; border-radius:8px; padding:0 15px; margin-bottom:20px; font-size:15px; box-sizing:border-box; text-align:center;" placeholder="비밀번호">
            <div style="display:flex; gap:10px;">
                <button type="button" onclick="$('#qna_password_modal').css('display', 'none');" style="flex:1; height:48px; background:#f1f5f9; color:#64748b; border:none; border-radius:8px; font-weight:600; font-size:15px; cursor:pointer;">취소</button>
                <button type="submit" id="modal_submit_btn" style="flex:1; height:48px; background:#a855f7; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:15px; cursor:pointer;">확인</button>
            </div>
        </form>
    </div>
</div>

<script>
// 세션 스토리지에 저장된 아코디언 상태 복원
$(document).ready(function() {
    var open_id = sessionStorage.getItem('qna_open_id');
    if (open_id !== null) {
        $('.qna-content-row').hide();
        $('#content_row_' + open_id).show();
        sessionStorage.removeItem('qna_open_id'); // 1회성 소모
    }
});

function show_password_modal(w, wr_id, list_index) {
    $('#modal_w').val(w);
    $('#modal_wr_id').val(wr_id);
    $('#modal_list_index').val(list_index);
    $('#modal_wr_password').val('');
    $('#qna_password_modal').css('display', 'flex');
    setTimeout(function() { $('#modal_wr_password').focus(); }, 100);
}

function submit_password_modal(f) {
    var $btn = $('#modal_submit_btn');
    $btn.text('확인중...').prop('disabled', true);
    
    var w = $('#modal_w').val();
    
    // 수정(w=u) 및 삭제(w=d)는 페이지 이동이 필요하므로 직접 POST 전송
    if (w == 'u' || w == 'd') {
        var base_url = g5_bbs_url.replace('http://', 'https://');
        if (w == 'u') {
            f.action = base_url + '/write.php';
        } else if (w == 'd') {
            f.action = base_url + '/delete.php';
        }
        f.method = 'POST';
        f.submit();
        return;
    }
    
    // 조회(w=s)일 경우에만 AJAX 요청 (아코디언용)
    // SSL 환경에서 http 주소로 AJAX 요청 시 Mixed Content 차단 (status 0, empty error) 방지
    var skin_url = '<?php echo $board_skin_url ?>'.replace('http://', 'https://');
    $.ajax({
        url: skin_url + '/ajax.password_check.php',
        type: 'POST',
        data: $(f).serialize(),
        dataType: 'json',
        success: function(data) {
            $btn.text('확인').prop('disabled', false);
            if (data.success) {
                var w = $('#modal_w').val();
                if (w == 's') {
                    // 조회 성공 시 아코디언을 열도록 세션에 저장 후 새로고침
                    var list_index = $('#modal_list_index').val();
                    sessionStorage.setItem('qna_open_id', list_index);
                    location.reload();
                } else if (w == 'u') {
                    // 수정 화면으로 이동
                    location.href = g5_bbs_url + '/write.php?w=u&bo_table=<?php echo $bo_table ?>&wr_id=' + $('#modal_wr_id').val();
                }
            } else {
                alert(data.msg);
                $('#modal_wr_password').val('').focus();
            }
        },
        error: function(xhr, status, error) {
            $btn.text('확인').prop('disabled', false);
            alert('통신 오류가 발생했습니다: ' + error);
        }
    });
}
</script>
