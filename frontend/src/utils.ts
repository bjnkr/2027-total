export const formatNumberWithCommas = (value: string): string => {
    if (!value) return '';
    const num = parseFormattedNumber(value);
    if (num === '') return '';
    return Number(num).toLocaleString('ko-KR');
};

export const parseFormattedNumber = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
};
