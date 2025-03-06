"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./calendar.module.css";
import { useInterviews } from "@/hooks/useInterviews";
import { useRef } from "react";
import Image from "next/image";
import Clock from "@/public/icons/clock.svg";
import Interviewers from "@/public/icons/interviewers.svg";
import Location from "@/public/icons/location.svg";

export interface Event {
  id: string;
  date: string; // full datetime as string from API
  time: string; // separate time string (e.g., "10:00 AM")
  applicant: string;
  team: string;
  room: string;
  interviewers: { name: string; role?: string }[];
  color?: string;
}

interface EventDetailsProps {
  event: Event | null;
  popupPosition: { x: number; y: number };
  onClose: () => void;
  onAttend: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, popupPosition, onClose, onAttend }) => {
  if (!event) return null;

  const startTime = new Date(event.date);
  const endTime = new Date(startTime);
  endTime.setMinutes(startTime.getMinutes() + 30);

  const formattedDate = startTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formattedStartTime = startTime
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .toUpperCase();

  const formattedEndTime = endTime
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .toUpperCase();

  return (
    <div
      className={styles.eventDetailsPopup}
      style={{
        top: popupPosition.y,
        left: popupPosition.x,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className={styles.eventDetailsContent}>
        <h3>Summary</h3>
        <div className={styles.detailItem}>
          <div className={`${styles.detailBullet} ${styles.green}`}></div>
          <div className={styles.detailText}>
            {event.applicant} / {event.team}
          </div>
        </div>
        <div className={styles.detailItem}>
          <Image src={Clock.src} className={styles.detailIcon} alt="Location" height={15} width={15} />
          <div className={styles.detailText}>
            {formattedDate} <br /> <span>{formattedStartTime} - {formattedEndTime}</span>
          </div>
        </div>
        <div className={styles.detailItem}>
          <Image src={Location.src} className={styles.detailIcon} alt="Location" height={15} width={15} />
          <div className={styles.detailText}>{event.room || "No room"}</div>
        </div>
        <div className={styles.detailItem}>
          <Image src={Interviewers.src} className={styles.detailIcon} alt="Location" height={15} width={15} />
          <div className={styles.detailText}>
            <div>Interviewers</div>
            <div className={styles.subtitle}>{event.interviewers.length} people</div>
            {event.interviewers.map((interviewer, index) => (
              <div key={index} className={styles.interviewer}>
                <div
                  className={`${styles.interviewerDot} ${index === 0 ? styles.blue : styles.brown
                    }`}
                ></div>
                <div className={styles.subtitle}>{interviewer.name}</div>
              </div>
            ))}
          </div>
        </div>
        <button className={styles.attendButton} onClick={onAttend}>
          Attend
        </button>
      </div>
    </div>
  );
};

// Helper to convert a timeslot string (e.g. "10:00 AM") into a 24-hour number.
const getHourFromTimeSlot = (timeStr: string): number | null => {
  const match = timeStr.match(/^(\d+):00\s*(AM|PM)$/i);
  if (!match) return null;
  let hour = parseInt(match[1], 10);
  const period = match[2].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour;
};

const Calendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const { data: session, status } = useSession();
  const router = useRouter();
  const { interviews, fetchInterviews, isLoading } = useInterviews();
  const [currentTime, setCurrentTime] = useState(new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closeEventDetails();
      }
    };
    if (selectedEvent) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedEvent]);

  // Update currentTime every second for smooth movement.
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status !== "loading" && (!session || !session?.user?.admin)) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  // Get all dates for the current week.
  const getWeekDates = (date: Date) => {
    const result: Date[] = [];
    const day = date.getDay();
    const diff = date.getDate() - day;
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(date);
      weekDay.setDate(diff + i);
      result.push(weekDay);
    }
    return result;
  };

  const weekDates = getWeekDates(currentWeek);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  // Capture mouse click coordinates when an event is clicked.
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  // Filter events for the current week.
  const filteredEvents = interviews.filter((event: Event) => {
    const eventDate = new Date(event.date);
    return weekDates.some(
      (date) =>
        date.getDate() === eventDate.getDate() &&
        date.getMonth() === eventDate.getMonth() &&
        date.getFullYear() === eventDate.getFullYear()
    );
  });

  const eventsByDay = weekDates.map((date) => {
    return filteredEvents.filter((event: Event) => {
      const eventDate = new Date(event.date);
      return (
        date.getDate() === eventDate.getDate() &&
        date.getMonth() === eventDate.getMonth() &&
        date.getFullYear() === eventDate.getFullYear()
      );
    });
  });

  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const attendInterview = async (interviewId: string) => {
    try {
      const adminId = session.user.id;
      const formData = { interviewId, adminId }

      const response = await fetch('/api/interviews/admin-attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Interview attended!");
        fetchInterviews();
        closeEventDetails();
      } else {
        console.error("Interview attendance submission failed");
      }
    } catch (error) {
      console.error("Error submitting interview attendance:", error);
    }
  }

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <h2>Interviews</h2>
        <p>The full interview schedule.</p>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Week</span>
            <button className={styles.controlButton} onClick={handlePrevWeek}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M15,6 L9,12 L15,18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
            <button className={styles.controlButton} onClick={handleNextWeek}>
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M9,6 L15,12 L9,18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
          <button className={styles.teamButton}>Full Team</button>
        </div>
      </div>
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <div className={`${styles.headerCell} ${styles.timeHeader}`}></div>
          {weekDates.map((date, index) => (
            <div key={index} className={`${styles.headerCell} ${styles.dayHeader}`}>
              <div className={`${styles.dayNumber} ${isSameDay(date, new Date()) ? styles.currentDay : ""}`}>
                {date.getDate()}
              </div>
              <div className={styles.dayName}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.calendarBody}>
          {timeSlots.map((time, timeIndex) => {
            const slotHour = getHourFromTimeSlot(time);
            const isCurrentHourRow =
              slotHour !== null && slotHour === currentTime.getHours();
            return (
              <div key={timeIndex} className={styles.timeRow}>
                <div className={styles.timeCell}>{time}</div>
                {weekDates.map((date, dayIndex) => (
                  <div key={dayIndex} className={styles.dayCell}>
                    {eventsByDay[dayIndex]
                      .filter((event: Event) => event.time === time)
                      .map((event, eventIndex) => {
                        let bgColor = "#e1f5fe";
                        let borderColor = "#4fc3f7";
                        if (event.color === "red") {
                          bgColor = "#ffebee";
                          borderColor = "#ef9a9a";
                        } else if (event.color === "purple") {
                          bgColor = "#f3e5f5";
                          borderColor = "#ce93d8";
                        } else if (event.color === "brown") {
                          bgColor = "#efebe9";
                          borderColor = "#bcaaa4";
                        } else if (event.color === "orange") {
                          bgColor = "#fff3e0";
                          borderColor = "#ffcc80";
                        }
                        return (
                          <div
                            key={eventIndex}
                            className={styles.event}
                            style={{
                              backgroundColor: bgColor,
                              borderLeftColor: borderColor,
                              borderLeftWidth: "4px",
                            }}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            {event.applicant}
                          </div>
                        );
                      })}
                  </div>
                ))}
                {isCurrentHourRow && (
                  <div
                    className={styles.currentTimeMarker}
                    style={{ top: `${(currentTime.getMinutes() / 60) * 100}%` }}
                  >
                    <div className={styles.currentTimeCircle}></div>
                    <div className={styles.currentTimeLine}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selectedEvent && (
        <div ref={popupRef}>
          <EventDetails
            event={selectedEvent}
            popupPosition={popupPosition}
            onClose={closeEventDetails}
            onAttend={() => attendInterview(selectedEvent.id)}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;