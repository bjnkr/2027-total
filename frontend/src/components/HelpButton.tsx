export default function HelpButton({ label, subject, onClick }: { label: '입력 도움말' | '설명 보기'; subject: string; onClick: () => void }) {
    return <button type="button" className="help-btn" onClick={onClick} aria-label={`${subject} ${label}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><circle cx="12" cy="7.5" r=".8" fill="currentColor" stroke="none" /></svg>
        <span>{label}</span>
    </button>;
}
