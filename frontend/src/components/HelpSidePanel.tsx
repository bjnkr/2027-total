import { useState, useEffect, useRef } from 'react';
import ResultHelpResources from './ResultHelpResources';
import { HELP_CONTENTS } from '../data/helpContents';

interface Props {
    topic: string | null;
    onClose: () => void;
    showAllIncome?: boolean;
    showResultResources?: boolean;
    focusedTopic?: string | null;
    focusRequestId?: number;
}

const INCOME_HELP_TOPICS = ['earned_income', 'private_transfer', 'public_transfer', 'property_income', 'expenditure_deduction'];

const STEP_HELP_TOPICS = ['basic_info', 'earned_income', 'automobile_business', 'property_debt'];
const STEP_HELP_LABELS = ['기본 정보', '소득 정보', '자동차', '재산/부채'];

export default function HelpSidePanel({ topic, onClose, showResultResources: defaultResultResources = false, showAllIncome: defaultAllIncome = false, focusedTopic = null, focusRequestId = 0 }: Props) {
    const [viewedStep, setViewedStep] = useState<number | null>(null);
    const requestedResources = topic === 'major_criteria';
    const showAllIncome = viewedStep === null ? defaultAllIncome && !requestedResources : viewedStep === 2;
    const showResultResources = viewedStep === 0 || (viewedStep === null && (defaultResultResources || requestedResources));
    const displayedTopic = viewedStep === null || viewedStep === 0
        ? requestedResources ? 'basic_info' : topic
        : STEP_HELP_TOPICS[viewedStep - 1];
    const activeStep = viewedStep ?? (defaultResultResources || requestedResources ? 0 : defaultAllIncome ? 2 : STEP_HELP_TOPICS.indexOf(topic ?? '') + 1);
    const contentRef = useRef<HTMLDivElement>(null);
    const incomeSections = useRef<Record<string, HTMLElement | null>>({});
    const [selectedIncomeTopic, setSelectedIncomeTopic] = useState(
        focusedTopic && INCOME_HELP_TOPICS.includes(focusedTopic) ? focusedTopic : 'earned_income'
    );
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    useEffect(() => {
        setExpandedSection(0);
        setViewedStep(null);
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [topic, defaultAllIncome, focusRequestId, defaultResultResources]);

    useEffect(() => {
        if (!showAllIncome) return;
        setSelectedIncomeTopic(
            focusedTopic && INCOME_HELP_TOPICS.includes(focusedTopic) ? focusedTopic : 'earned_income'
        );
    }, [showAllIncome, focusedTopic, focusRequestId]);

    useEffect(() => {
        if (!showAllIncome) return;
        const frame = requestAnimationFrame(() => {
            const container = contentRef.current;
            const section = incomeSections.current[selectedIncomeTopic];
            if (!container) return;
            // Scroll only the help body, keeping the input form in place.
            const top = section
                ? section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 20
                : 0;
            container.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
        });
        return () => cancelAnimationFrame(frame);
    }, [showAllIncome, selectedIncomeTopic, focusRequestId]);

    if (!displayedTopic || !HELP_CONTENTS[displayedTopic]) return null;

    const content = HELP_CONTENTS[displayedTopic];

    return (
        <div className="help-side-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 상단 헤더 및 탭 영역 */}
            <div className="help-side-panel-header" style={{ display: 'block', backgroundColor: '#ffffff', padding: '0', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <div style={{ backgroundColor: '#005a9c', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 'bold' }}>도움말</h2>
                    <button className="icon-btn help-panel-close" onClick={onClose} aria-label="닫기" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                {/* 탭 버튼들 */}
                <div className="help-step-navigation">
                    <nav className="help-step-buttons" aria-label="단계별 도움말">
                        {STEP_HELP_TOPICS.map((stepTopic, index) => {
                            const step = index + 1;
                            return (
                                <button type="button" key={stepTopic}
                                    className={activeStep === step ? 'is-active' : ''}
                                    aria-label={`${step}: ${HELP_CONTENTS[stepTopic].title}`}
                                    aria-pressed={activeStep === step}
                                    title={HELP_CONTENTS[stepTopic].title}
                                    onClick={() => {
                                        setViewedStep(step);
                                        setExpandedSection(0);
                                        setSelectedIncomeTopic('earned_income');
                                        if (contentRef.current) contentRef.current.scrollTop = 0;
                                    }}>
                                    <span className="help-step-circle" aria-hidden="true">{step}</span>
                                    <span className="help-step-label">{STEP_HELP_LABELS[index]}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <button type="button" className={`help-resources-button${activeStep === 0 ? ' is-active' : ''}`}
                        aria-pressed={activeStep === 0}
                        onClick={() => {
                            setViewedStep(0);
                            setExpandedSection(0);
                            if (contentRef.current) contentRef.current.scrollTop = 0;
                        }}>
                        주요 기준
                    </button>
                </div>
            </div>

            {/* 본문 영역 */}
            <div ref={contentRef} className="help-side-panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {showAllIncome && (
                    <div className="income-help-list">
                        {INCOME_HELP_TOPICS.map(incomeTopic => {
                            const incomeHelp = HELP_CONTENTS[incomeTopic];
                            const isSelected = selectedIncomeTopic === incomeTopic;
                            return (
                                <section
                                    key={incomeTopic}
                                    ref={element => { incomeSections.current[incomeTopic] = element; }}
                                    className="income-help-section"
                                    aria-labelledby={`income-help-${incomeTopic}`}
                                >
                                    <h3 className="income-help-heading">
                                        <button
                                            type="button"
                                            key={`${incomeTopic}-${focusRequestId}`}
                                            id={`income-help-${incomeTopic}`}
                                            className={`income-help-title${isSelected ? ' is-selected' : ''}${isSelected && focusedTopic === incomeTopic ? ' is-highlighted' : ''}`}
                                            aria-expanded={isSelected}
                                            aria-controls={`income-help-body-${incomeTopic}`}
                                            onClick={() => setSelectedIncomeTopic(incomeTopic)}
                                        >
                                            <span>{incomeHelp.title}</span>
                                        </button>
                                    </h3>
                                    <div id={`income-help-body-${incomeTopic}`} hidden={!isSelected}>
                                    {isSelected && <>
                                    <p className="income-help-question">{incomeHelp.question}</p>
                                    {incomeHelp.content && <div className="income-help-intro">{incomeHelp.content}</div>}
                                    {incomeHelp.sections?.map((section, index) => (
                                        <div key={index} className="income-help-detail">
                                            <h4>{section.title}</h4>
                                            <div>{section.body}</div>
                                        </div>
                                    ))}
                                    </>}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
                {showResultResources && <ResultHelpResources />}
                {!showAllIncome && !showResultResources && (
                    <div className="faq-item">
                        <div className="faq-question" style={{ marginBottom: '16px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{content.question}</span>
                        </div>
                        <div className="faq-answer" style={{ padding: '0' }}>
                            {content.content && <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>{content.content}</div>}
                            
                            {content.sections && content.sections.length > 0 && (
                                <div className="accordion-container" style={{ borderTop: '1px solid #e2e8f0' }}>
                                    {content.sections.map((section, index) => {
                                        const isExpanded = expandedSection === index;
                                        return (
                                            <div key={index} className="accordion-item" style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '0', borderRadius: '0', borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
                                                <button 
                                                    className="accordion-header" 
                                                    onClick={() => setExpandedSection(isExpanded ? null : index)}
                                                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}
                                                >
                                                    <span>{section.title}</span>
                                                    <svg 
                                                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                                                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0, color: '#94a3b8' }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </button>
                                                {isExpanded && (
                                                    <div className="accordion-body" style={{ padding: '0 8px 16px 8px', backgroundColor: 'transparent', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                                                        {section.body}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
