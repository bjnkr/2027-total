<?php
if (!defined("_GNUBOARD_")) exit; // 개별 페이지 접근 불가
include_once(G5_LIB_PATH.'/thumbnail.lib.php');

// add_stylesheet('css 구문', 출력순서); 숫자가 작을 수록 먼저 출력됨
add_stylesheet('<link rel="stylesheet" href="'.$board_skin_url.'/style.css">', 0);
?>

<script src="<?php echo G5_JS_URL; ?>/viewimageresize.js"></script>

<!-- 게시물 읽기 시작 { -->

<article id="bo_v" style="width:<?php echo $width; ?>">
    <header>
        <h2 id="bo_v_title">
            <?php if ($category_name) { ?>
            <span class="bo_v_cate"><?php echo $view['ca_name']; // 분류 출력 끝 ?></span> 
            <?php } ?>
            <span class="bo_v_tit">
            <?php
            echo cut_str(get_text($view['wr_subject']), 70); // 글제목 출력
            ?></span>
        </h2>
    </header>

    <section id="bo_v_info">
        <h2>페이지 정보</h2>
        <div class="profile_info">
        	<div class="pf_img"><?php echo get_member_profile_img($view['mb_id']) ?></div>
        	<div class="profile_info_ct">
        		<span class="sound_only">작성자</span> <strong><?php echo $view['name'] ?><?php if ($is_ip_view) { echo "&nbsp;($ip)"; } ?></strong><br>
       		 	<span class="sound_only">댓글</span><strong><a href="#bo_vc"> <i class="fa fa-commenting-o" aria-hidden="true"></i> <?php echo number_format($view['wr_comment']) ?>건</a></strong>
        		<span class="sound_only">조회</span><strong><i class="fa fa-eye" aria-hidden="true"></i> <?php echo number_format($view['wr_hit']) ?>회</strong>
        		<strong class="if_date"><span class="sound_only">작성일</span><i class="fa fa-clock-o" aria-hidden="true"></i> <?php echo date("y-m-d H:i", strtotime($view['wr_datetime'])) ?></strong>
    		</div>
    	</div>

    	<!-- 게시물 상단 버튼 시작 { -->
	    <div id="bo_v_top">
	        <?php ob_start(); ?>

	        <ul class="btn_bo_user bo_v_com">
				<li><a href="<?php echo $list_href ?>" class="btn_b01 btn" title="목록"><i class="fa fa-list" aria-hidden="true"></i><span class="sound_only">목록</span></a></li>
	            <?php if ($reply_href) { ?><li><a href="<?php echo $reply_href ?>" class="btn_b01 btn" title="답변"><i class="fa fa-reply" aria-hidden="true"></i><span class="sound_only">답변</span></a></li><?php } ?>
	            <?php if ($write_href) { ?><li><a href="<?php echo $write_href ?>" class="btn_b01 btn" title="글쓰기"><i class="fa fa-pencil" aria-hidden="true"></i><span class="sound_only">글쓰기</span></a></li><?php } ?>
	        	<?php if($update_href || $delete_href || $copy_href || $move_href || $search_href) { ?>
	        	<li>
	        		<button type="button" class="btn_more_opt is_view_btn btn_b01 btn"><i class="fa fa-ellipsis-v" aria-hidden="true"></i><span class="sound_only">게시판 리스트 옵션</span></button>
		        	<ul class="more_opt is_view_btn"> 
			            <?php 
			            $needs_password_ud = (!$view['mb_id'] && !$is_admin); 
			            if ($update_href) { ?>
			                <li><a href="<?php echo $needs_password_ud ? '#none' : $update_href ?>" <?php if ($needs_password_ud) { ?>onclick="show_password_modal('u', '<?php echo $view['wr_id']; ?>'); return false;"<?php } ?>>수정<i class="fa fa-pencil-square-o" aria-hidden="true"></i></a></li>
			            <?php } ?>
			            <?php if ($delete_href) { ?>
			                <li><a href="<?php echo $needs_password_ud ? '#none' : $delete_href ?>" onclick="<?php if ($needs_password_ud) { ?>if(confirm('한번 삭제한 자료는 복구할 수 없습니다.\n\n정말 삭제하시겠습니까?')) show_password_modal('d', '<?php echo $view['wr_id']; ?>'); return false;<?php } else { ?>del(this.href); return false;<?php } ?>">삭제<i class="fa fa-trash-o" aria-hidden="true"></i></a></li>
			            <?php } ?>
			            <?php if ($copy_href) { ?><li><a href="<?php echo $copy_href ?>" onclick="board_move(this.href); return false;">복사<i class="fa fa-files-o" aria-hidden="true"></i></a></li><?php } ?>
			            <?php if ($move_href) { ?><li><a href="<?php echo $move_href ?>" onclick="board_move(this.href); return false;">이동<i class="fa fa-arrows" aria-hidden="true"></i></a></li><?php } ?>
			            <?php if ($search_href) { ?><li><a href="<?php echo $search_href ?>">검색<i class="fa fa-search" aria-hidden="true"></i></a></li><?php } ?>
			        </ul> 
	        	</li>
	        	<?php } ?>
	        </ul>
	        <script>

            jQuery(function($){
                // 게시판 보기 버튼 옵션
				$(".btn_more_opt.is_view_btn").on("click", function(e) {
                    e.stopPropagation();
				    $(".more_opt.is_view_btn").toggle();
				})
;
                $(document).on("click", function (e) {
                    if(!$(e.target).closest('.is_view_btn').length) {
                        $(".more_opt.is_view_btn").hide();
                    }
                });
            });
            </script>
	        <?php
	        $link_buttons = ob_get_contents();
	        ob_end_flush();
			?>
	    </div>
	    <!-- } 게시물 상단 버튼 끝 -->
    </section>

    <section id="bo_v_atc">
        <h2 id="bo_v_atc_title">본문</h2>

        <!-- 본문 내용 시작 { -->
        <div id="bo_v_con">
            <?php
            // HTML 첨부파일 감지 및 렌더링
            $html_content = '';
            if (isset($view['file']) && $view['file']['count'] > 0) {
                for ($i=0; $i<count($view['file']); $i++) {
                    if (isset($view['file'][$i]['source']) && $view['file'][$i]['source']) {
                        $ext = strtolower(pathinfo($view['file'][$i]['source'], PATHINFO_EXTENSION));
                        if ($ext === 'html' || $ext === 'htm') {
                            global $bo_table;
                            $html_file_path = G5_DATA_PATH . '/file/' . $bo_table . '/' . $view['file'][$i]['file'];
                            if (file_exists($html_file_path)) {
                                $html_content .= file_get_contents($html_file_path);
                                // 본문으로 렌더링한 HTML 파일은 하단 다운로드 목록 등에서 숨김 처리
                                $view['file'][$i]['view'] = 1;
                            }
                        }
                    }
                }
            }

            if ($html_content) {
                echo '<div class="info-html-render" style="width: 100%;">';
                echo $html_content;
                echo '</div>';
                // HTML 본문 렌더링 후, 기존 에디터 내용이나 다른 첨부 이미지가 있다면 함께 출력
                echo get_view_thumbnail($view['content']); 
            } else {
                echo get_view_thumbnail($view['content']); 
            }
            ?>
        </div>
        <?php //echo $view['rich_content']; // {이미지:0} 과 같은 코드를 사용할 경우 ?>
        <!-- } 본문 내용 끝 -->



    </section>

    <?php
    $cnt = 0;
    if ($view['file']['count']) {
        for ($i=0; $i<count($view['file']); $i++) {
            if (isset($view['file'][$i]['source']) && $view['file'][$i]['source'] && !$view['file'][$i]['view'])
                $cnt++;
        }
    }
	?>

    <?php if($cnt) { ?>
    <!-- 첨부파일 시작 { -->
    <section id="bo_v_file">
        <h2>첨부파일</h2>
        <ul>
        <?php
        // 가변 파일
        for ($i=0; $i<count($view['file']); $i++) {
            if (isset($view['file'][$i]['source']) && $view['file'][$i]['source'] && !$view['file'][$i]['view']) {
         ?>
            <li>
               	<i class="fa fa-folder-open" aria-hidden="true"></i>
                <a href="<?php echo $view['file'][$i]['href'];  ?>" class="view_file_download">
                    <strong><?php echo $view['file'][$i]['source'] ?></strong> <?php echo $view['file'][$i]['content'] ?> (<?php echo $view['file'][$i]['size'] ?>)
                </a>
                <br>
                <span class="bo_v_file_cnt"><?php echo $view['file'][$i]['download'] ?>회 다운로드 | DATE : <?php echo $view['file'][$i]['datetime'] ?></span>
            </li>
        <?php
            }
        }
         ?>
        </ul>
    </section>
    <!-- } 첨부파일 끝 -->
    <?php } ?>

    <?php if(isset($view['link']) && array_filter($view['link'])) { ?>
    <!-- 관련링크 시작 { -->
    <section id="bo_v_link">
        <h2>관련링크</h2>
        <ul>
        <?php
        // 링크
        $cnt = 0;
        for ($i=1; $i<=count($view['link']); $i++) {
            if ($view['link'][$i]) {
                $cnt++;
                $link = cut_str($view['link'][$i], 70);
            ?>
            <li>
                <i class="fa fa-link" aria-hidden="true"></i>
                <a href="<?php echo $view['link_href'][$i] ?>" target="_blank">
                    <strong><?php echo $link ?></strong>
                </a>
                <br>
                <span class="bo_v_link_cnt"><?php echo $view['link_hit'][$i] ?>회 연결</span>
            </li>
            <?php
            }
        }
        ?>
        </ul>
    </section>
    <!-- } 관련링크 끝 -->
    <?php } ?>
    

    <?php
    // 코멘트 입출력
    include_once(G5_BBS_PATH.'/view_comment.php');
	?>
</article>
<!-- } 게시판 읽기 끝 -->

<script>
<?php if ($board['bo_download_point'] < 0) { ?>
$(function() {
    $("a.view_file_download").click(function() {
        if(!g5_is_member) {
            alert("다운로드 권한이 없습니다.\n회원이시라면 로그인 후 이용해 보십시오.");
            return false;
        }

        var msg = "파일을 다운로드 하시면 포인트가 차감(<?php echo number_format($board['bo_download_point']) ?>점)됩니다.\n\n포인트는 게시물당 한번만 차감되며 다음에 다시 다운로드 하셔도 중복하여 차감하지 않습니다.\n\n그래도 다운로드 하시겠습니까?";

        if(confirm(msg)) {
            var href = $(this).attr("href")+"&js=on";
            $(this).attr("href", href);

            return true;
        } else {
            return false;
        }
    });
});
<?php } ?>

function board_move(href)
{
    window.open(href, "boardmove", "left=50, top=50, width=500, height=550, scrollbars=1");
}
</script>

<script>
$(function() {
    $("a.view_image").click(function() {
        window.open(this.href, "large_image", "location=yes,links=no,toolbar=no,top=10,left=10,width=10,height=10,resizable=yes,scrollbars=no,status=no");
        return false;
    });

    // 추천, 비추천
    $("#good_button, #nogood_button").click(function() {
        var $tx;
        if(this.id == "good_button")
            $tx = $("#bo_v_act_good");
        else
            $tx = $("#bo_v_act_nogood");

        excute_good(this.href, $(this), $tx);
        return false;
    });

    // 이미지 리사이즈
    $("#bo_v_atc").viewimageresize();
});

function excute_good(href, $el, $tx)
{
    $.post(
        href,
        { js: "on" },
        function(data) {
            if(data.error) {
                alert(data.error);
                return false;
            }

            if(data.count) {
                $el.find("strong").text(number_format(String(data.count)));
                if($tx.attr("id").search("nogood") > -1) {
                    $tx.text("이 글을 비추천하셨습니다.");
                    $tx.fadeIn(200).delay(2500).fadeOut(200);
                } else {
                    $tx.text("이 글을 추천하셨습니다.");
                    $tx.fadeIn(200).delay(2500).fadeOut(200);
                }
            }
        }, "json"
    );
}
</script>
<!-- } 게시글 읽기 끝 -->

<?php
// delete.php 통과를 위한 전용 삭제 토큰 발급 및 세션 저장
$custom_delete_token = md5(uniqid(rand(), true));
set_session('ss_delete_token', $custom_delete_token);
?>
<!-- 비밀번호 확인 팝업 모달 (조회/수정/삭제 공통) -->
<div id="qna_password_modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.4); z-index:9999; align-items:center; justify-content:center; backdrop-filter: blur(2px);">
    <div style="background:#fff; padding:30px; border-radius:12px; width:90%; max-width:400px; text-align:center; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
        <h3 style="margin:0 0 15px 0; color:#1e293b; font-size:20px; font-weight:700;">비밀번호 확인</h3>
        <p style="color:#64748b; font-size:14px; margin-bottom:20px; line-height:1.5;">비회원 글입니다.<br>작성 시 입력한 비밀번호를 입력해주세요.</p>
        <form onsubmit="submit_password_modal(this); return false;">
            <input type="hidden" name="w" id="modal_w" value="">
            <input type="hidden" name="bo_table" value="<?php echo $bo_table ?>">
            <input type="hidden" name="wr_id" id="modal_wr_id" value="">
            <input type="hidden" name="token" value="<?php echo $custom_delete_token; ?>">
            <input type="password" name="wr_password" id="modal_wr_password" required style="width:100%; height:48px; border:1px solid #e2e8f0; border-radius:8px; padding:0 15px; margin-bottom:20px; font-size:15px; box-sizing:border-box; text-align:center;" placeholder="비밀번호">
            <div style="display:flex; gap:10px;">
                <button type="button" onclick="$('#qna_password_modal').css('display', 'none');" style="flex:1; height:48px; background:#f1f5f9; color:#64748b; border:none; border-radius:8px; font-weight:600; font-size:15px; cursor:pointer;">취소</button>
                <button type="submit" id="modal_submit_btn" style="flex:1; height:48px; background:#a855f7; color:#fff; border:none; border-radius:8px; font-weight:600; font-size:15px; cursor:pointer;">확인</button>
            </div>
        </form>
    </div>
</div>

<script>
function show_password_modal(w, wr_id) {
    $('#modal_w').val(w);
    $('#modal_wr_id').val(wr_id);
    $('#modal_wr_password').val('');
    $('#qna_password_modal').css('display', 'flex');
    setTimeout(function() { $('#modal_wr_password').focus(); }, 100);
}

function submit_password_modal(f) {
    var $btn = $('#modal_submit_btn');
    $btn.text('확인중...').prop('disabled', true);
    
    // 수정/삭제(w=u, d)는 페이지 이동이 어차피 발생하므로 
    // 통신 오류 방지를 위해 그누보드 기본 로직으로 직접 POST 전송합니다.
    // HTTP -> HTTPS 리다이렉트 시 POST 값 증발을 막기 위해 주소를 https://로 강제 변환합니다.
    var base_url = g5_bbs_url.replace('http://', 'https://');
    var w = $('#modal_w').val();
    
    if (w == 'u') {
        f.action = base_url + '/write.php';
    } else if (w == 'd') {
        f.action = base_url + '/delete.php';
    }
    
    f.method = 'POST';
    f.submit();
}
</script>