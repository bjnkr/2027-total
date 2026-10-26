import React from 'react';

export interface HelpSection {
    title: string;
    body: React.ReactNode;
}

export interface HelpContent {
    title: string;
    question: string;
    content?: React.ReactNode;
    sections?: HelpSection[];
}

export const HELP_CONTENTS: Record<string, HelpContent> = {
    private_transfer: {
        title: "사적 이전소득 입력 방법 안내",
        question: "사적이전소득은 뭘 입력하는 거야?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    <strong>사적 이전소득</strong>은  1년 이내에 "친척이나 지인 등 사적인 관계에서 지원받는 금품"을 뜻합니다. 공공기관이나 나라에서 주는 돈(공적 이전소득)과 구분되는 개념입니다.<br />
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 어떤 금액을 입력해야 하나요?",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>부모님이나 자녀에게 입금 받은 금액</strong><br />
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(예: 자녀가 보내주는 용돈)</span>
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>친척이나 지인에게 도움 받은 금액</strong>
                        </li>
                        <li>
                            <strong>이혼 후 받고 있는 양육비 , 양육비 선지급금</strong>
                        </li>
                    </ul>
                )
            },
            {
                title: "2. 주의할 점",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '12px' }}>
                          사적이전소득은 지원 받은 횟수에 따라 소득으로 반영되는 금액 계산 방식이 다릅니다. ( 6회 이상 : 정기지원 , 6회미만 비정기지원)    
                        </li>
                    </ul>
                )
            },
            {
                title: "💡 입력 방법 팁",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <li style={{ marginBottom: '8px' }}>매월 일정한 금액을 받으신다면 <strong>'매월 같은 금액 지원'</strong>을</li>
                      <li>달마다 받는 금액이 다르시다면 <strong>'매월 다른 금액 지원'</strong>을 선택하여 월별로 입력해 주세요.</li>
                    </ul>
                )
            }
        ]
    },
    earned_income: {
        title: "근로/사업 소득 입력 안내",
        question: "세전 기준인가요, 세후 기준인가요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    근로소득과 사업소득은 반드시 <strong>세전(세금 공제 전) 금액</strong>을 기준으로 입력하셔야 합니다.
                </p>
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                    <li style={{ marginBottom: '8px' }}>통장에 찍힌 실수령액이 아닌, <strong>세전 급여액</strong>을 입력해 주세요.</li>
                    <li style={{ marginBottom: '8px' }}>국민연금 납부금액은 본인 부담 금액을 입력하시면 됩니다.( 월급에서 공제되는 금액 , 지역가입자는 납부금액 전부를 입력해 주세요 )</li>
                    <li>해당되는 근로소득(사업소득) 공제 항목을  선택해 주세요.</li>
                </ul>
            </>
        )
    },
    public_transfer: {
        title: "공적 이전소득 입력 안내",
        question: "공적 이전소득이 무엇인가요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    공적 이전소득은 나라나 자치단체, 공공기관으로부터 정기적으로 지급받는 각종 수당이나 급여, 연금 등을 의미합니다.<br /><br />
                    (다) 공적 이전소득 칸에는 가구원분들이 받고 계신 아래 소득들을 모두 더해 입력하시면 됩니다.
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 대표적으로 입력해야 하는 항목",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', marginBottom: '8px', listStyleType: 'circle' }}>
                                <li>국민연금, 유족연금 , 장애연금</li>
                                <li>기초연금</li>
                                <li>실업급여 , 구직촉진수당</li>  
                                <li>산재보험급여</li>
                                <li>육아휴직급여</li>
                            </ul>
                        </li>
                    </ul>
                )
            },
            {
                title: "2. 입력할 때 꼭 제외해야 하는 항목",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>일시적인 지원금:</strong> 정부나 지자체에서 한시적으로 지급한 일회성 재난지원금 등은 포함하지 않습니다.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>기초생활보장 급여:</strong> 생계급여, 주거급여 등은 소득 산정에서 제외되므로 입력하지 않습니다.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>한부모 가족 지원 아동양육비</strong>
                        </li>
                        <li>
                            <strong>장애인연금 , 장애수당</strong>
                        </li>
                    </ul>
                )
            }
        ]
    },
    property_income: {
        title: "재산소득 입력 안내",
        question: "재산소득은 어떤 항목을 입력하나요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    재산소득은 말 그대로 가지고 계신 재산(집, 땅, 예금 등)을 통해 정기적으로 얻는 수입을 뜻합니다.<br /><br />
                    (라) 재산소득 칸은 크게 <strong>임대소득 , 연금소득</strong>과 <strong>이자소득</strong> 두 가지로 나누어져 있으며, 가구원분들의 소득을 합산해 입력하시면 됩니다.
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 임대소득",
                body: (
                    <>
                        <p style={{ margin: '0 0 10px 0', color: '#475569', lineHeight: '1.6' }}>보유하신 부동산(주택, 상가, 토지 등)을 타인에게 빌려주고 정기적으로 받는 수입입니다.</p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>입력 대상:</strong> 매달 받는 <strong>상가 월세, 주택 월세</strong> 등<br />
                            </li>
                         </ul>
                    </>
                )
            },
            {
                title: "2. 연금소득",
                body: (
                    <>
                        <p style={{ margin: '0 0 10px 0', color: '#475569', lineHeight: '1.6' }}></p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>입력 대상:</strong> 퇴직연금 , 주택연금 , 민간 연금보험 가입에 따라 매월 받는 금액
                            </li>
                            <li>
                                <strong>주택연금은</strong> 매달 받는 금액의 절반(50%)만 계산해서 입력해 주시면 됩니다.
                            </li>
                        </ul>
                    </>
                )
            },
            {
                title: "3. 이자소득",
                body: (
                    <>
                        <p style={{ margin: '0 0 10px 0', color: '#475569', lineHeight: '1.6' }}>은행 예금, 적금, 주식, 채권 등에서 발생하는 이자나 주식 배당 수입입니다.</p>
                        <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                            <li style={{ marginBottom: '8px' }}>
                                <strong>입력 대상:</strong> 정기예금이나 적금이 만기 되었을 때 받은 <strong>세전 이자</strong>, 주식 배당금 등<br />
                                <strong>대상 연도:</strong> 이자소득은 전년도(2026년)에 발생한 이자소득을 올해 적용합니다 <strong>2026년도에</strong> 받은  이자 소득을 적어주세요
                            </li>
                            <li>
                                <strong>가입기간 입력:</strong> 이자소득 바로 옆에 있는 '<strong>가입기간</strong>' 칸에는 해당 금융상품의 총 가입 개월 수 (예: 1년 만기 적금이라면 12)를 입력하시면 됩니다.
                            </li>
                        </ul>
                    </>
                )
            }
        ]
    },
    expenditure_deduction: {
        title: "지출요인 공제 안내",
        question: "어떤 지출을 공제받을 수 있나요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    <strong>(마) 지출요인 공제</strong> 칸에는 가구원분들 중 아래에 해당하는 지출이 있다면 그 금액을 합산하여 입력하시면 됩니다.
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 어떤 지출을 입력해야 하나요? (대표적인 항목)",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>의료비:</strong>  만성질환 등의 치료･요양･재활로 인하여 “조사일 기준”으로 직전 3개월 간 
지출한 의료비(의료기관의 진단서 및 진료비 영수증 첨부)의 월평균 금액 <br />
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(※ 일반적인 감기 치료비 등은 제외)</span>
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>대학 등록금:</strong>  보장가구원 중 대학생(34세 이하, 1년 이내 휴학생 포함) 등록금을 가구의 근로･
사업소득에서 지출한 경우의 해당 지출금액 <br />
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(※ 1학기분 등록금 / 6)</span>
                        </li>


                    </ul>
                )
            }
        ]
    },
    basic_info: {
        title: "기본정보 입력 안내",
        question: "기본정보는 어떻게 선택하나요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    <strong>1. 기본정보</strong>에서는 딱 세 가지만 선택하시면 됩니다. ( 1인가구는 두 가지 )
                </p>
                <p style={{ margin: '0 0 20px 0', color: '#3b82f6', fontWeight: '500' }}>
                    모두 선택하셨다면 아래 파란색 [다음] 버튼을 눌러 소득 정보 입력으로 넘어가세요!
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 가구원 수",
                body: (
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        주민등록등본에 같이 있고 생계를 함께하는 <strong>가족이 총 몇 명인지</strong> 선택하세요.<br />
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(예: 혼자면 1인 가구, 둘이면 2인 가구)</span>
                    </p>
                )
            },
            {
                title: "2. 한부모 가족 여부",
                body: (
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        이혼 또는 사별 후 혼자서 자녀를 양육하는 한부모 가족이시라면 <strong>[예]</strong>, 아니라면 <strong>[아니오]</strong>를 선택하세요.
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}>모자 가족 ,또는 부자가족 [ 자녀의 연령이 18세미만 (취학시 22세 미만) ]</li>
                                <li>조손가족 - 할아버지 또는 할머니와 18세 미만의 손자녀 가구 (취학시 22세 미만)</li>
                            </ul>

                    </p>
                )
            },
            {
                title: "3. 재산특례 여부",
                body: (
                    <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        근로 무능력자로만 구성된 가구 [ 가구원 모두 아래의 항목에 해당되는 경우 ]

                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}>65세이상</li>
                                <li style={{ marginBottom: '4px' }}>18세 미만</li>
                                <li style={{ marginBottom: '4px' }}>장애의 정도가 심한 장애인</li>
                                <li>근로능력 평가를 통해 근로능력이 없다고 판정한 사람</li>
                            </ul>

                    </p>
                )
            }
        ]
    },
    property_debt: {
        title: "재산/부채 입력 안내",
        question: "재산과 부채는 어떻게 입력하나요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', margin: 0, color: '#334155' }}>
                    <strong>4. 재산/부채</strong> 단계는 복지 자격 심사에서 가장 중요한 가구의 총자산과 부채를 파악하는 마지막 단계입니다.
                </p>
            </>
        ),
        sections: [
            {
                title: "1. 주거용 재산 (내가 살고 있는 집)",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>어떤 걸 넣나요?:</strong> 현재 살고 있는 집의 공시지가, 보증금을 적습니다.
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}><strong>자가(내 집)인 경우:</strong> 주택의 공시지가를 입력합니다.</li>
                                <li><strong>전세/월세인 경우:</strong> 계약서에 적혀 있는 <strong>전세 보증금</strong> 또는 <strong>월세 보증금</strong>을 입력합니다.</li>
                                <li><strong>LH , GH , IH 공공 임대주택인 경우:</strong> 본인 부담금 금액을 적어주세요 ( 공사에서 지원 받은 금액은 부채에 입력하시면 안됩니다 )</li>
                            </ul>
                        </li>
                    </ul>
                )
            },
            {
                title: "2. 일반 재산 (거주하는 집 이외)",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>어떤 걸 넣나요?:</strong> 거주하는 집 외에 보유한 다른 재산을 뜻합니다.
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}>살고 있는 집 외에 따로 가지고 있는 주택, 토지(땅), 상가, 오피스텔, 분양권 등</li>
                                <li>공시지가를 기준으로 입력하시면 됩니다.</li>
                            </ul>
                        </li>
                    </ul>
                )
            },
            {
                title: "3. 금융 재산 (예,적금 및 주식)",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>어떤 걸 넣나요?:</strong>
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}>보통예금 , 저축성예금 : 3개월 평균 잔액</li>
                                <li style={{ marginBottom: '4px' }}>정기예금, 정기적금 : 잔액 또는 총납입액</li>
                                <li>주식, 펀드 : 최종시세가액</li>
                                <li>보험 : 해약할 경우 지급받게 될 환급금 (해약환급금)</li>
                            </ul>
                        </li>
                        <li>
                            <strong>참고:</strong> 보통 예금의 경우 "3개월 평균 잔액"을 재산으로 계산하므로 "통장 잔액"과 차이가 나는 경우가 많습니다.
                        </li>
                    </ul>
                )
            },
            {
                title: "4. 부채 (대출금)",
                body: (
                    <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong>어떤 걸 넣나요?:</strong> 소득이나 재산에서 차감해 주는 공식적인 빚입니다.
                            <ul style={{ paddingLeft: '20px', marginTop: '4px', listStyleType: 'circle' }}>
                                <li style={{ marginBottom: '4px' }}><strong>금융기관 대출:</strong> 은행, 보험사, 수협/농협 등에서 받은 대출금
                                </li>
                                <li><strong>임대보증금:</strong> 내가 다른 사람에게 집을 세주고 받은 보증금</li>
                            </ul>
                        </li>
                    </ul>
                )
            }
        ]
    },
    automobile_business: {
        title: "생업용 자동차 판단 안내",
        question: "생업용 자동차는 어떤 경우를 말하나요?",
        content: (
            <>
                <p style={{ lineHeight: '1.6', marginBottom: '20px', color: '#334155' }}>
                    <strong>생업용 자동차란</strong> 자동차가 생계유지를 위한 직접적인 수단이 되는 경우로서, 자동차를 이용하여 직접적인 소득활동에 참여하거나, 자동차가 없을 경우 소득활동이 곤란한 경우를 말합니다.
                </p>
                <h4 style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '10px' }}>주요 예시:</h4>
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#475569', lineHeight: '1.6' }}>
                    <li style={{ marginBottom: '8px' }}>화물 운반을 통해 소득활동에 참여하는 경우.</li>
                    <li style={{ marginBottom: '8px' }}>농어촌 지역에서 농어업을 위해 사용하는 경우.</li>
                    <li style={{ marginBottom: '8px' }}>전기공이나 인테리어 기술자들이 도구를 차에 싣고 공사 현장을 찾아다니며 소득활동을 하는 경우.</li>
                    <li>새벽이나 야간에 소득활동을 하는 등 대중교통 이용이 어렵거나 여러 지역을 빈번히 이동하는 경우.</li>
                </ul>
            </>
        )
    }
};
