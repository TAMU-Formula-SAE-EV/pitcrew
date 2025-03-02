import { motion } from 'framer-motion';
import styles from './Timeline.module.css';
import { useState, useEffect } from "react";
import Image from 'next/image';

type StatusType = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

interface TimelineProps {
    activeTab: StatusType;
    onTabChange: (tab: StatusType) => void;
}

async function getInterviewing() { // get interviewing applicants
    const response = await fetch(`/api/applicants/interviewing`);
    const data = await response.json();
    const names = data.map((applicant: { name: string }) => `${applicant.name}`);
    const emails = data.map((applicant: { email: string }) => `${applicant.email}`);
    return {names, emails}
}

export default function Timeline({ activeTab, onTabChange }: TimelineProps) {
    const tabs = ['Applied', 'Interviewing', 'Offer', 'Rejected'];
    const [isPopupOpen, setIsPopupOpen] = useState(false); // bool for popup visibility
    const [names, setNames] = useState([]);
    const [emails, setEmails] = useState([]);
    const [copyNamesIcon, setCopyNamesIcon] = useState("/icons/clipboard_empty.svg");
    const [copyEmailsIcon, setCopyEmailsIcon] = useState("/icons/clipboard_empty.svg");
  
    useEffect(() => { // effect to get interviewing names and emails 
      if (isPopupOpen) {
        getInterviewing().then(({ names, emails }) => {
          setNames(names);
          setEmails(emails);
        });
      }
    }, [isPopupOpen]);

    const copyNames = () => {
        const names_text = names.join(","); // comma separated
        navigator.clipboard.writeText(names_text)
        setCopyNamesIcon("/icons/clipboard_check.svg");
        setTimeout(() => setCopyNamesIcon("/icons/clipboard_empty.svg"), 3000);
    };

    const copyEmails = () => {
        const emails_text = emails.join(","); // comma separated
        navigator.clipboard.writeText(emails_text)
        setCopyEmailsIcon("/icons/clipboard_check.svg");
        setTimeout(() => setCopyEmailsIcon("/icons/clipboard_empty.svg"), 3000);
    };
    
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
                {activeTab === "Interviewing" ? <button className={styles.tab_extra} onClick={() => {setIsPopupOpen(true);}}> Emails </button> : ""}
            </div>
            {/* popup pane */} 
            {isPopupOpen && (
                <div className={styles.popup_overlay} onClick={() => setIsPopupOpen(false)}>
                  <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setIsPopupOpen(false)} className={styles.popup_exit}>✖</button>
                    <h2 className={styles.popup_header}>Interviewing Applicants</h2>
                    
                    <div className={styles.table}>
                        <div className={styles.column}>
                            <div className={styles.header}>
                                Name
                                <button className={styles.icon} onClick={copyNames}>
                                    <Image src={copyNamesIcon} alt="Copy Names" width="15" height="15"/>
                                </button>
                            </div>
                            {names.length > 0 ? (
                                names.map((name, index) => (
                                    <div key={index} className={styles.item}>
                                        {name}
                                    </div>
                                ))
                            ) : (
                                <div className={styles.item}>Loading...</div>
                            )}
                        </div>
                        <div className={styles.column}>
                            <div className={styles.header}>
                                Email
                                <button className={styles.icon} onClick={copyEmails}>
                                    <Image src={copyEmailsIcon} alt="Copy Email" width="15" height="15"/>
                                </button>
                            </div>
                            {names.length > 0 ? (
                                names.map((name, index) => (
                                    <div key={index} className={styles.item}>
                                        {emails[index]}
                                    </div>
                                ))
                            ) : (
                                <div className={styles.item}>Loading...</div>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
            )}
        </div>
    );
}