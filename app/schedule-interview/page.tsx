'use client'
import { useEffect, useState } from 'react';
import styles from './ScheduleInterview.module.css';
import ApplicationSidebar from '../../components/schedule-interview/ScheduleInterviewSidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SUBTEAM_DESIGN_CHALLENGES } from '@/constants/questions';
import { useInterviews } from '@/hooks/useInterviews';
import Clock from "@/public/icons/clock.svg";
import Interviewers from "@/public/icons/interviewers.svg";
import Location from "@/public/icons/location.svg";
import Image from 'next/image';
import { DetailedApplicantWithResponses } from '@/types';
import { useApplicantDetails } from '@/hooks/useApplicantDetails';

const ScheduleInterview = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [isCancelationModalOpen, setIsCancelationModalOpen] = useState(false);

    const [hasInterview, setHasInterview] = useState(false);
    const [interviewers, setInterviewers] = useState<string[] | null>(null);

    const dates = [
        { day: "Mon", date: "11", slots: 7, available: true },
        { day: "Tue", date: "12", slots: 1, available: true },
        { day: "Wed", date: "13", slots: 0, available: false },
        { day: "Thu", date: "14", slots: 3, available: true },
        { day: "Fri", date: "15", slots: 5, available: true },
        { day: "Sat", date: "16", slots: 2, available: true },
        { day: "Sun", date: "17", slots: 0, available: false },
    ];

    const times = ["9:00 AM", "9:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM"];

    const { data: session, status } = useSession();
    const router = useRouter();

    const { activeInterviews, fetchInterviews, isLoading: isInterviewLoading } = useInterviews();
    const applicantInterview = activeInterviews.find(
        (interview) => interview.applicantId === session?.user?.id
    );

    // controls whether the applicant views the interview details
    const publishInterview = true;

    useEffect(() => {
        setInterviewers(applicantInterview?.interviewers?.map((i) => i.name) ?? null);
    }, [applicantInterview]);

    useEffect(() => {
        if (publishInterview && interviewers && interviewers.length > 0) {
            setHasInterview(true);
        }
    }, [interviewers, publishInterview])

    const { data: applicant, isLoading: isApplicantLoading } = useApplicantDetails(session?.user?.email ?? '');
    const applicantWithResponses = applicant as DetailedApplicantWithResponses;

    useEffect(() => {
        if (status !== 'loading' && !session || session?.user?.admin || session && session.user.status !== 'INTERVIEWING') {
            router.push('/');
        }
        if (session && session.user.status === 'APPLIED') {
            router.push('/application/submitted');
        }
        if (applicantInterview) {
            setActiveStep(1);
        }
    }, [session, status, router, applicantInterview]);

    if (status === 'loading' || isInterviewLoading || isApplicantLoading) {
        return <p>Loading...</p>;
    }

    if (!session) {
        return null;
    }

    const subteam = applicantWithResponses.selectedSubteam;
    const designChallengeLink = SUBTEAM_DESIGN_CHALLENGES[subteam.toLowerCase()];

    const handleNext = () => {
        setActiveStep((prev) => Math.min(prev + 1, 1));
    };

    const validateFields = () => {
        const newErrors: { [key: string]: string } = {};

        if (!selectedDate) {
            newErrors['date'] = 'Please select an interview date before proceeding';
        }

        if (!selectedTime) {
            newErrors['time'] = 'Please select an interview time before proceeding';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            setIsSubmitting(false);
            return;
        }
        setIsConfirmationModalOpen(true);
    };

    const interviewConfirmation = async () => {
        setIsConfirmationModalOpen(false);
        setIsSubmitting(true);

        try {
            const applicantId = session.user.id;
            const date = new Date('2025-03-07T00:00:00Z');
            const formData = { selectedDate: date, selectedTime, location: 'ZACH', subteam, applicantId }

            const response = await fetch('/api/interviews/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                handleNext();
                fetchInterviews();
            } else {
                console.error("Form submission failed");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelInterview = async () => {
        setIsCancelationModalOpen(true);
    }

    const interviewCancelation = async () => {
        setIsCancelationModalOpen(false);

        try {
            const applicantId = session.user.id;

            const response = await fetch('/api/interviews/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicantId }),
            });

            if (response.ok) {
                fetchInterviews();
                window.location.reload();
            } else {
                console.error("Interview cancelation failed");
            }
        } catch (error) {
            console.error("Error canceling interview:", error);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className={styles.contentContainer}>
                        <h2 className={styles.heading}>Schedule Interview</h2>
                        <p className={styles.subteam}>{subteam}</p>

                        <div className={styles.dates}>
                            {dates.map(({ day, date, slots, available }) => (
                                <div
                                    key={date}
                                    className={`
                                        ${styles.dateCard} 
                                        ${selectedDate === date ? styles.selected : ""} 
                                        ${!available ? styles.disabled : ""}
                                    `}
                                    onClick={() => available && setSelectedDate(date)}
                                >
                                    <p className={styles.day}>{day}</p>
                                    <p className={styles.date}>{date}</p>
                                    <p className={styles.slots}>{slots} slots</p>
                                </div>
                            ))}
                        </div>
                        <div className={styles.errorPlaceholder}>
                            {errors['date'] && <p className={styles.error}>{errors['date']}</p>}
                        </div>

                        <p className={styles.timeInfo}>Central Time / 30 Minute Interview</p>
                        <div className={styles.times}>
                            {times.map((time) => (
                                <button
                                    key={time}
                                    className={`
                                        ${styles.timeButton} 
                                        ${selectedTime === time ? styles.selectedTime : ""}
                                    `}
                                    onClick={() => setSelectedTime(time)}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                        <div className={styles.errorPlaceholder}>
                            {errors['time'] && <p className={styles.error}>{errors['time']}</p>}
                        </div>

                        <div className={styles.noAvailability}>
                            <div className={styles.noAvailabilityText}>
                                <h4>No matching availability?</h4>
                                Click the button below to flag your profile and provide some times that work for
                                you. We will reach out to you personally to schedule an interview. {" "}
                                <u> Only do this if you absolutely cannot make any available time slots work. </u>
                                {" "} Otherwise, select a time slot from above and submit your availability.
                            </div>
                            <button className={styles.flagButton}>Flag Account</button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className={styles.contentContainer}>
                        {!hasInterview ? (
                            <div className={styles.roomAssignment}>
                                <h2 className={styles.heading}>Room assignment</h2>
                                <p className={styles.subteam}>
                                    We&apos;ve received your preferred time! Please sit tight while we assign you to a room
                                    for an interview. This process can take anywhere from a couple hours to several days.
                                    Continue monitoring your inbox for an update and check back here for confirmation. If
                                    you have any concerns, reach out to your contact or email tamuformulae@gmail.com. While
                                    you wait, complete the design challenge below. Thank you!
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h2 className={styles.heading}>Interview Confirmation</h2>
                                <p className={styles.subteam}> Your time and location is confirmed - see you there! </p>
                                <div className={styles.card}>
                                    <div className={styles.cardContent}>
                                        <div className={styles.interviewerSection}>
                                            <p className={styles.meetingText}>You are meeting with</p>
                                            <p className={styles.interviewerName}>{interviewers?.at(0)}</p>
                                        </div>

                                        <div className={styles.detailsSection}>
                                            <div className={styles.detailRow}>
                                                <Image src={Clock.src} alt="Clock" height={20} width={20} />
                                                <div className={styles.timeContainer}>
                                                    <span className={styles.detailLabel}>Wednesday, April 14th</span>
                                                    <span className={styles.timeRange}>10:00 AM - 10:30 AM</span>
                                                </div>
                                            </div>

                                            <div className={styles.detailRow}>
                                                <Image src={Location.src} alt="Location" height={20} width={20} />
                                                <span className={styles.detailLabel}>ZACH 282N</span>
                                            </div>

                                            <div className={styles.detailRow}>
                                                <Image src={Interviewers.src} alt="Interviewers" height={20} width={20} />
                                                <span className={styles.detailLabel}>Software Subteam</span>
                                            </div>
                                        </div>

                                        <div className={styles.buttonContainer}>
                                            <button className={styles.addToCalendar}>Add to Google Calendar</button>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        )}

                        <div className={styles.designContainer}>
                            <h2 className={styles.heading}>Design Challenge</h2>
                            <p className={styles.subteam}>{subteam}</p>
                            <div className={styles.designChallenge}>
                                <p className={styles.designText}>
                                    As part of your interview process, you are asked to complete this design challenge.
                                    You will be asked about your solution at your interview, so make sure to bring it
                                    there. You do not need to submit this anywhere.
                                </p>
                                <div className={styles.openChallenge}>
                                    <a href={designChallengeLink}>
                                        Open Challenge
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cancelInterview}>
                            <div className={styles.cancelInterviewText}>
                                <h4>Need to cancel?</h4>
                                Click the button below to cancel your interview for any reason, no questions asked.
                                If you need to reschedule, contact our team directly either by reaching out to your
                                contact or emailing tamuformulae@gmail.com. {" "}
                            </div>
                            <button className={styles.cancelInterviewButton} onClick={handleCancelInterview}>Cancel Interview</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleStepClick = (stepIndex: number) => {
        setActiveStep(stepIndex);
    };

    return (
        <div className={styles.container}>
            {isSubmitting ? (
                <div>
                    <p>Submitting...</p>
                </div>
            ) : (
                <>
                    <ApplicationSidebar
                        activeStep={activeStep}
                        onStepClick={handleStepClick}
                    />
                    <div className={styles.formContainer}>
                        <div className={styles.formGrid}>
                            {renderStepContent()}
                        </div>
                        <div className={styles.buttons}>
                            {activeStep === 0 && (
                                <button
                                    className={styles.nextButton}
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {isConfirmationModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Confirm Interview Timing</h2>
                        <p className={styles.modalText}>
                            You have selected {" "}
                            <b>March {`${selectedDate} at ${selectedTime}`} for your interview.</b>.
                            Once submitted, any rescheduling must be done through by emailing {" "}
                            <i>tamuformulae@gmail.com.</i> Are you sure you want to proceed?
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={() => setIsConfirmationModalOpen(false)}
                                className={styles.cancelModalButton}
                            >
                                No
                            </button>
                            <button
                                onClick={interviewConfirmation}
                                className={styles.confirmButton}
                            >
                                Yes, Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCancelationModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2 className={styles.modalTitle}>Cancel Interview Timing</h2>
                        <p className={styles.modalText}>
                            You have selected {" "}
                            <b>March {`${selectedDate} at ${selectedTime}`} for your interview.</b>.
                            Once canceled, any rescheduling must be done through by emailing {" "}
                            <i>tamuformulae@gmail.com.</i> Are you sure you want to proceed?
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={() => setIsCancelationModalOpen(false)}
                                className={styles.cancelModalButton}
                            >
                                No
                            </button>
                            <button
                                onClick={interviewCancelation}
                                className={styles.cancelButton}
                            >
                                Yes, cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const queryClient = new QueryClient();

export default function ScheduleInterviewWrapper() {
    return (
        <QueryClientProvider client={queryClient}>
            <ScheduleInterview />
        </QueryClientProvider>
    );
}