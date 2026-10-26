export type CalculationIconName = 'report' | 'income' | 'property' | 'total' | 'people' | 'location' | 'home' | 'gift' | 'bank' | 'interest' | 'calculator' | 'car' | 'document';

const paths: Record<CalculationIconName, string> = {
    report: 'M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3 M8 16v-4 M12 16V8 M16 16v-6 M14 3h7v7 M21 3l-9 9',
    income: 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2 M3 6h18v14H3z M3 10l9 4 9-4 M10 13v3h4v-3',
    property: 'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7',
    total: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
    people: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 7 M22 21v-2a4 4 0 0 0-3-3.87',
    location: 'M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0 M15 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
    home: 'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-7h6v7',
    gift: 'M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8H8a3 3 0 1 1 3-3z M12 8h4a3 3 0 1 0-3-3z',
    bank: 'M3 9h18L12 3z M5 9v9 M10 9v9 M14 9v9 M19 9v9 M3 21h18 M3 18h18',
    interest: 'M3 17l6-6 4 4 8-10 M15 5h6v6 M3 21h18',
    calculator: 'M6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1 M8 6h8v4H8z M8 14h1 M15 14h1 M8 18h1 M15 18h1',
    car: 'M5 7l2-4h10l2 4 M3 7h18v10H3z M6 17v3 M18 17v3 M6 11h2 M16 11h2',
    document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h5',
};

export default function CalculationIcon({ name, className = '' }: { name: CalculationIconName; className?: string }) {
    return <svg className={`calc-icon ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>;
}
