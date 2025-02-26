import { motion } from 'framer-motion';
import styles from './Timeline.module.css';
import { StatusType } from '@/types';

interface TimelineProps {
    activeTab: StatusType;
    onTabChange: (tab: StatusType) => void;
}

export default function Timeline({ activeTab, onTabChange }: TimelineProps) {
    const tabs = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
    
    return (
        <div className={styles.container}>
            <div className={styles.tabList}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab as StatusType)}
                        className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="underline"
                                className={styles.underline}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}