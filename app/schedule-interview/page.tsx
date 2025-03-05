'use client'
import { useEffect, useState } from 'react';
import styles from './ScheduleInterview.module.css';
import ApplicationSidebar from '../../components/schedule-interview/ScheduleInterviewSidebar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const ScheduleInterview = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

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

    useEffect(() => {
        if (status !== 'loading' && !session || session?.user?.admin) {
            router.push('/');
        }
        if (session && session.user.status === 'APPLIED') {
            router.push('/application/submitted');
        }
        if (session && session.user.status !== 'INTERVIEWING') {
            router.push('/');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (!session) {
        return null;
    }

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
            // const response = await fetch('/api/schedule-interview', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData),
            // });
            // console.log('Submitted Data: ', response);

            const response = { ok: true };

            if (response.ok) {
                handleNext();
            } else {
                console.error("Form submission failed");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <div className={styles.contentContainer}>
                        <h2 className={styles.heading}>Schedule Interview</h2>
                        <p className={styles.subteam}>Software Subteam</p>

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
                                <u>
                                    Only do this if you absolutely cannot make any available time slots work.
                                </u>
                                {" "} Otherwise, select a time slot from above and submit your availability.
                            </div>
                            <button className={styles.flagButton}>Flag Account</button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className={styles.contentContainer}>
                        <h2>Room assignment</h2>
                        <p>
                            We&apos;ve received your preferred time! Please sit tight while we assign you to a room
                            for an interview. This process can take anywhere from a couple hours to several days.
                            Continue monitoring your inbox for an update and check back here for confirmation. If
                            you have any concerns, reach out to your contact or email tamuformulae@gmail.com. While
                            you wait, complete the design challenge below. Thank you!
                        </p>
                        <div className={styles.designChallenge}>
                            <h2>Design Challenge</h2>
                            <p>Software Subteam</p>
                            <p>
                                As part of your interview process, you are asked to complete this design challenge.
                                You will be asked about your solution at your interview, so make sure to bring it
                                there. You do not need to submit this anywhere.
                            </p>
                            <button>
                                Open Challenge
                            </button>
                        </div>
                        <div className={styles.cancelInterview}>
                            <div className={styles.cancelInterviewText}>
                                <h4>Need to cancel?</h4>
                                Click the button below to cancel your interview for any reason, no questions asked.
                                If you need to reschedule, contact our team directly either by reaching out to your
                                contact or emailing tamuformulae@gmail.com. {" "}
                                <u> Only do this if you absolutely cannot make any available time slots work. </u>
                                {" "} Otherwise, select a time slot from above and submit your availability.
                            </div>
                            <button className={styles.flagButton}>Flag Account</button>
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
                            Once submitted, any rescheduling must be done through by emailing
                            <i>tamuformulae@gmail.com.</i> Are you sure you want to proceed?
                        </p>
                        <div className={styles.modalButtons}>
                            <button
                                onClick={() => setIsConfirmationModalOpen(false)}
                                className={styles.cancelButton}
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
        </div>
    );
};

export default ScheduleInterview;