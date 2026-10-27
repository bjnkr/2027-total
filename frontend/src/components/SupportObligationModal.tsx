import { ResourceModal } from './ResultHelpResources';
import './SupportObligationModal.css';

const chartUrl = 'https://bjn.kr/data/file/info/thumb-e3aac85ec5b18bba950ff0b2b421fc71_htElxyrT_2a91c415c155965d1951863d4e06f9794b66196b_835x1044.png';

export default function SupportObligationModal({ onClose }: { onClose: () => void }) {
    return <ResourceModal resource={{ id: 'support-obligation', title: '부양능력 기준표', description: '', imageUrl: chartUrl }} onClose={onClose} />;
}
