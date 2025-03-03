"use client"
import styles from './Applicant.module.css';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { useApplicantDetails } from '@/hooks/useApplicantDetails';
import { formatDistanceToNow } from 'date-fns';
import { formatSubteamName } from './ApplicantList';
import Image from 'next/image';
import Star from "../../public/icons/star.svg";
import Resume from "../../public/icons/resume.svg";
import { AllResponses, DetailedApplicantWithResponses } from '@/types';
import DownArrow from "../../public/icons/down-arrow.svg";
import { GENERAL_QUESTIONS, SUBTEAM_QUESTIONS } from '@/constants/questions';
import { getSubteamAbbreviation } from '@/utils/utils';
import { toast } from 'react-hot-toast';

type ApplicantProps = {
    selectedEmail: string | null;
};

type DecisionType = 'accept' | 'comment' | 'reject' | 'override' | null;

export default function Applicant({ selectedEmail }: ApplicantProps){
    const [activeTab, setActiveTab] = useState('info');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [decision, setDecision] = useState<DecisionType>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [selectedSubteam, setSelectedSubteam] = useState('');
    const { 
        data: applicant, 
        isLoading, 
        error, 
        refetchApplicant 
    } = useApplicantDetails(selectedEmail);
    const applicantWithResponses = applicant as DetailedApplicantWithResponses;
    const daysAgo = applicant ? formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true }) : '';
    const subteams = applicant?.subteams
        ?.sort((a, b) => a.preferenceOrder - b.preferenceOrder)
        .map(s => getSubteamAbbreviation(s.subteam.name))
        .join('/');
    const { data: session, status } = useSession();
    const userName = session && session.user?.name;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (modalRef.current && !modalRef.current.contains(event.target as Node) && showModal) {
                // don't close modal when clicking outside
                // this is so users complete their decision
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const handleSubmitDecision = async () => {
        if (!selectedEmail || !comment.trim() || !decision) return;
        if (decision === 'accept' && !selectedSubteam) return;
        if (decision === 'override' && !selectedSubteam) return;
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/applicants/interview-decisions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: selectedEmail,
                    commenter: userName,
                    comment: comment.trim(),
                    decision: decision,
                    selectedSubteam: (decision === 'accept' || decision === 'override') ? selectedSubteam : ''
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit decision');
            }
            
            toast.success('Decision submitted successfully');

            setShowModal(false);
            setComment('');
            setSelectedSubteam('');
            
            refetchApplicant(); // refreshes with new decision
        } catch (error) {
            console.error('Error submitting decision:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit decision');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectDecision = (selected: DecisionType) => {
        setDecision(selected);
        setShowDropdown(false);
        setShowModal(true);
    };

    if (!selectedEmail) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <p>Select an applicant to view their details</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>Loading applicant details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>Error loading applicant details</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerRight}>
                    <h1 className={styles.applicantName}>{applicant?.name}</h1>
                    <h1 className={styles.headerSub}>{applicant?.major}</h1>
                    {/* <div className={styles.tile}>EV First Choice</div> todo - actually implement */}
                    {/* <div className={styles.tile}>
                        {typeof applicant?.approvalCount === 'number' ? 
                            Array.from({ length: applicant.approvalCount }).map((_, index) => (
                                <div key={index} className={styles.approvalItem}>
                                    Approval {index + 1}
                                </div>
                        )) : <h1>NA</h1>}
                    </div> */}
                    <div className={styles.tile}>{subteams}</div>
                    <div className={styles.tile}>{applicant?.year}</div>
                    <button className={styles.resumeButton}>
                        <Image src={Resume.src} width={21.6} height={12} alt='Resume'/>
                    </button>
                    <h1 className={styles.headerSub}>{daysAgo}</h1>
                    <button 
                        className={`${styles.starButton} ${applicant?.starred ? styles.starred : ''}`}
                        aria-label="Toggle star"
                    >
                        <Image 
                            src={Star.src} 
                            width={15} 
                            height={15} 
                            alt='Star'
                        />
                    </button>
                </div>
                <div className={styles.decisionWrapper} ref={dropdownRef}>
                    <button 
                        className={styles.decisionButton}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span>Decision</span>
                        <Image 
                            src={DownArrow.src} 
                            width={12} 
                            height={12} 
                            alt="Options"
                            className={`${styles.dropdownArrow} ${showDropdown ? styles.rotated : ''}`}
                        />
                    </button>
                    
                    {showDropdown && (
                        <div className={styles.dropdown}>
                            <button 
                                className={`${styles.dropdownItem} ${styles.acceptItem}`} 
                                onClick={() => handleSelectDecision('accept')}
                            >
                                Accept
                            </button>
                            <button 
                                className={`${styles.dropdownItem} ${styles.neutralItem}`} 
                                onClick={() => handleSelectDecision('comment')}
                            >
                                Neutral
                            </button>
                            <button 
                                className={`${styles.dropdownItem} ${styles.rejectItem}`} 
                                onClick={() => handleSelectDecision('reject')}
                            >
                                Reject
                            </button>
                            <div className={styles.dropdownDivider}></div>
                            <button 
                                className={`${styles.dropdownItem} ${styles.overrideItem}`} 
                                onClick={() => handleSelectDecision('override')}
                            >
                                Override
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className={styles.tabsContainer}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'info' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('info')}
                    >
                    Info
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'resume' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('resume')}
                    >
                    Resume
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'decisions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('decisions')}
                    >
                    Decisions
                </button>
            </div>
            
            <div className={styles.tabContent}>
                {activeTab === 'info' && (
                <div className={styles.infoTab}>
                    {/* General Questions Section */}
                    <h3>General Questions</h3>
                    <ul className={styles.questionsList}>
                    {GENERAL_QUESTIONS.map((q, idx) => {
                        let answer;
                        if (q.id === 'first_choice' || q.id === 'second_choice') {
                            return;
                        } else {
                        answer = applicantWithResponses.allResponses.generalResponses[q.id];
                        }
                        return (
                            <div key={idx} className={styles.questionAndAnswer}>
                                <h1>{idx + 1}. {q.question}</h1>
                                <h2>{String(answer ?? "No response")}</h2>
                            </div>
                        );
                    })}
                    </ul>

                    {/* Subteam Applications Section */}
                    {[...applicantWithResponses.allResponses.subteamApplications]
                    .sort((a, b) => {
                        const aPref = applicant?.subteams.find(
                        s => s.subteam.name.toLowerCase() === a.subteam.toLowerCase()
                        )?.preferenceOrder ?? 999;
                        const bPref = applicant?.subteams.find(
                        s => s.subteam.name.toLowerCase() === b.subteam.toLowerCase()
                        )?.preferenceOrder ?? 999;
                        return aPref - bPref;
                    })
                    .map((app) => {
                        const questions = SUBTEAM_QUESTIONS[app.subteam.toLowerCase()] || [];
                        return (
                        <div key={app.subteam} className={styles.subteamApplication}>
                            <h4>{app.subteam} Questions</h4>
                            <ul className={styles.questionsList}>
                            {questions.map((q, index) => {
                                const answer = app.responses[q.id];
                                return (
                                    <div key={index} className={styles.questionAndAnswer}>
                                        <h1>{index + 1}. {q.question}</h1>
                                        <h2>{String(answer ?? "No response")}</h2>
                                    </div>
                                );
                            })}
                            </ul>
                            {app.fileUrls && app.fileUrls.length > 0 && (
                            <div>
                                <strong>Files:</strong>
                                <ul>
                                {app.fileUrls.map((url, index) => (
                                    <li key={index}>
                                    <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}
                        </div>
                        );
                    })}
                </div>
                )}
                
                {activeTab === 'resume' && (
                    <div className={styles.resumeTab}>
                        {applicantWithResponses.allResponses.candidateInfo.resumeUrl ? (
                        <iframe 
                            src={`${applicantWithResponses.allResponses.candidateInfo.resumeUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                            title="Applicant Resume"
                            style={{ width: '100%', height: '80vh', border: 'none' }}
                        />
                        ) : (
                        <p>No resume available.</p>
                        )}
                    </div>
                )}

                {activeTab === 'decisions' && (
                <div className={styles.decisionsTab}>
                    {applicant?.interviewDecisions && applicant.interviewDecisions.length > 0 && (
                    <div className={styles.decisionsSection}>
                        <h3>Interview Decisions</h3>
                        <div className={styles.decisionsList}>
                        {applicant.interviewDecisions.map((decision) => (
                            <div key={decision.id} className={styles.decisionItem}>
                            <div className={styles.decisionHeader}>
                                <span className={`${styles.decisionType} ${styles[decision.type.toLowerCase()]}`}>
                                {decision.type} {decision.subteam ? '/' : ''} {decision.subteam}
                                </span>
                                <span className={styles.decisionMeta}>
                                by {decision.commenter} • {formatDistanceToNow(new Date(decision.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className={styles.decisionComment}>{decision.comment}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* comment modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} ref={modalRef}>
                        <div className={styles.modalHeader}>
                            <h2>
                                {decision === 'accept' && 'Why accept this applicant?'}
                                {decision === 'comment' && 'What is your comment on this applicant?'}
                                {decision === 'reject' && 'Why reject this applicant?'}
                                {decision === 'override' && 'Reason for override'}
                            </h2>
                        </div>
                        <div className={styles.modalBody}>
                            {
                                (decision == 'accept' || decision == 'override') && (
                                    <div className={styles.modalField}>
                                        <label htmlFor="subteamSelect">Which subteam should this applicant join?</label>
                                        <select id="subteamSelect" value={selectedSubteam} onChange={(e) => setSelectedSubteam(e.target.value)} className={styles.modalSelect}>
                                            <option value="">Select Subteam</option>
                                            {applicant?.subteams?.sort((a, b) => a.preferenceOrder - b.preferenceOrder).map((s) => (
                                                <option key={s.subteam.name} value={s.subteam.name}>
                                                    {formatSubteamName(s.subteam.name)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            }
                            <textarea
                                className={styles.commentTextarea}
                                placeholder="Enter a brief explanation of your decision..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={5}
                                autoFocus
                            />
                        </div>
                        <div className={styles.modalFooter}>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => {
                                    setComment('')
                                    setSelectedSubteam('')
                                    setShowModal(false)
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.submitButton}
                                onClick={handleSubmitDecision}
                                disabled={!comment.trim()}
                            >
                                Submit Decision
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// todo: check if user already left decision that wasn't neutral
// todo: check if user admin to show override functionality