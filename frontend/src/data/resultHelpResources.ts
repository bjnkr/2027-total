export interface ResultHelpResource {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

// ? imageUrl? ??? ?? ??? ???? ??? ??? ?????.
export const RESULT_HELP_RESOURCES: ResultHelpResource[] = [
    {
        id: 'median-income',
        title: '기준중위소득',
        description: '복지 지원의 기준이 되는 금액',
        imageUrl: 'https://bjn.kr/data/file/info/e3aac85ec5b18bba950ff0b2b421fc71_EtfXrsZ0_0244726c39a155ac693402cacd94750f12e6b21f.png',
    },
    {
        id: 'eligibility',
        title: '복지 지원 선정기준',
        description: '국민 기초생활 보장(생계,의료,주거,교육급여), 차상위 , 한부모가족 지원',
        imageUrl: 'https://bjn.kr/data/file/info/e3aac85ec5b18bba950ff0b2b421fc71_7pgcjKka_8e0b2c0bc6d00fa263715db44807c78aec48ecaf.png',
    },
    {
        id: 'standard-rent',
        title: '주거급여 기준임대료',
        description: '지역별 , 가구원수별 주거급여 기준임대료',
        imageUrl: 'https://bjn.kr/data/file/info/e3aac85ec5b18bba950ff0b2b421fc71_KHtxlRIB_6beaf3d26349377056f21e2032e565370cdd0550.png',
    },
    {
        id: 'p-income',
        title: '사적이전소득 공제금액',
        description: '기준 중위소득의 15%',
        imageUrl: 'https://bjn.kr/data/file/info/e3aac85ec5b18bba950ff0b2b421fc71_uEx80z9a_e9d6aed7b9a2eb9ccd40d146b4001798389a9ad9.png',
    },
       {
        id: 'p-income',
        title: '근로, 사업소득 공제 금액',
        description: '소득에서 차감하는 금액',
        imageUrl: 'https://bjn.kr/data/file/info/e3aac85ec5b18bba950ff0b2b421fc71_2C4jcT6s_b97dc10d79942e5901a577ea44b9db735844f8f1.png',
    },
];
