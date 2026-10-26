import { useEffect, useRef, useState } from 'react';
import { RESULT_HELP_RESOURCES, type ResultHelpResource } from '../data/resultHelpResources';

function ResourceModal({ resource, onClose }: { resource: ResultHelpResource; onClose: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [imageFailed, setImageFailed] = useState(false);
    const [imageRatio, setImageRatio] = useState<number | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        dialog?.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            dialog?.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className="result-resource-modal"
            style={imageRatio ? {
                width: `min(960px, calc(100vw - 32px), calc((min(900px, calc(100dvh - 32px)) - 8px) * ${imageRatio} + 8px))`,
            } : undefined}
            aria-label={resource.title}
            onCancel={onClose}
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}
        >
            <div className="result-resource-modal-inner">
                <button className="result-resource-modal-close" type="button" onClick={onClose} aria-label="닫기" autoFocus>닫기</button>
                <div className="result-resource-modal-body">
                    {!resource.imageUrl ? (
                        <p className="result-resource-placeholder">자료를 준비 중입니다.</p>
                    ) : imageFailed ? (
                        <p className="result-resource-placeholder" role="alert">이미지를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.</p>
                    ) : (
                        <img
                            src={resource.imageUrl}
                            alt={`${resource.title} 안내 자료`}
                            onLoad={event => {
                                const image = event.currentTarget;
                                if (image.naturalHeight > 0) setImageRatio(image.naturalWidth / image.naturalHeight);
                            }}
                            onError={() => setImageFailed(true)}
                        />
                    )}
                </div>
            </div>
        </dialog>
    );
}

export default function ResultHelpResources() {
    const [selected, setSelected] = useState<ResultHelpResource | null>(null);

    return (
        <>
            <div className="result-resource-list">
                <p className="result-resource-intro">계산 결과와 관련된 주요 기준을 확인하세요.</p>
                {RESULT_HELP_RESOURCES.map(resource => (
                    <button
                        key={resource.id}
                        type="button"
                        className="result-resource-link"
                        aria-haspopup="dialog"
                        onClick={() => setSelected(resource)}
                    >
                        <span>
                            <strong>{resource.title}</strong>
                            <span className="result-resource-description">{resource.description}</span>
                        </span>
                        <span aria-hidden="true">›</span>
                    </button>
                ))}
            </div>
            {selected && <ResourceModal key={selected.id} resource={selected} onClose={() => setSelected(null)} />}
        </>
    );
}
