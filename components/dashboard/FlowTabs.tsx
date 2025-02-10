'use client';
import { motion } from 'framer-motion';
import { Status } from '@prisma/client';
import styles from './FlowTabs.module.css';

interface FlowTabsProps {
    activeStatus: Status;
    onStatusChange: (status: Status) => void;
}

export function FlowTabs({ activeStatus, onStatusChange }: FlowTabsProps) {
    const tabs = [Status.APPLIED, Status.INTERVIEWING, Status.OFFER, Status.REJECTED];

    return (
        <div className={styles.tabContainer}>
            {tabs.map((status) => (
                <button
                    key={status}
                    onClick={() => onStatusChange(status)}
                    className={`${styles.tab} ${activeStatus === status ? styles.active : ''}`}
                >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                    {activeStatus === status && (
                        <motion.div 
                        className={styles.indicator} 
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}