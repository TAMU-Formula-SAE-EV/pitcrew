"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import styles from "./calendar.module.css";
import { useInterviews } from "@/hooks/useInterviews";
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

// Define subteam abbreviations (max 4 letters)
enum Subteams {
  SOFTWARE = "SOFT",
  DISTRIBUTED_BATTERY_MANAGEMENT = "DBAT",
  CHASSIS = "CHAS",
  ELECTRONICS = "ELEC",
  OPERATIONS = "OPER",
  SPONSOR_RELATIONS = "SPON",
  MARKETING = "MRKT",
  BUSINESS = "BUSN",
  POWERTRAIN = "PWRT",
  BATTERY = "BATT",
  AERODYNAMICS = "AERO",
  SUSPENSION = "SUSP",
  FINANCE = "FINC",
  NULL = ""
}

const getSubteamAbbr = (team: string): string => {
  return Subteams[team as keyof typeof Subteams] || team.slice(0, 4).toUpperCase();
};

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

  let adjustedX = popupPosition.x;
  const popupWidth = 400; // defined in CSS max-width
  if (popupPosition.x + popupWidth / 2 > window.innerWidth) {
    adjustedX = window.innerWidth - popupWidth / 2 - 10;
  }

  return (
    <div
      className={styles.eventDetailsPopup}
      style={{
        top: popupPosition.y,
        left: adjustedX,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className={styles.eventDetailsContent}>
        <h3>Summary</h3>
        <div className={styles.detailItem}>
          <div className={`${styles.detailBullet} ${styles.green}`}></div>
          <div className={styles.detailText}>
            {event.applicant} / {getSubteamAbbr(event.team)}
          </div>
        </div>
        <div className={styles.detailItemMultiple}>
          <Image src={Clock.src} className={styles.detailIcon} alt="Time" height={15} width={15} />
          <div className={styles.detailText}>
            {formattedDate} <br /> <span>{formattedStartTime} - {formattedEndTime}</span>
          </div>
        </div>
        <div className={styles.detailItem}>
          <Image src={Location.src} className={styles.detailIcon} alt="Location" height={15} width={15} />
          <div className={styles.detailText}>{event.room || "No room"}</div>
        </div>
        <div className={styles.detailItemMultiple}>
          <Image src={Interviewers.src} className={styles.detailIcon} alt="Interviewers" height={15} width={15} />
          <div className={styles.detailText}>
            <div>Interviewers</div>
            <div className={styles.subtitle}>{event.interviewers.length} people</div>
            {event.interviewers.map((interviewer, index) => (
              <div key={index} className={styles.interviewer}>
                <div
                  className={`${styles.interviewerDot} ${
                    index === 0 ? styles.blue : styles.brown
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
  const { interviews, isLoading } = useInterviews();
  const [currentTime, setCurrentTime] = useState(new Date());
  const popupRef = useRef<HTMLDivElement>(null);
  const [fullTeam, setFullTeam] = useState(false);

  // Valid week range
  const validStartDate = new Date("2025-03-13");
  const validEndDate = new Date("2025-03-25");

  const prevDisabled = currentWeek.getTime() <= validStartDate.getTime();
  const nextDisabled = currentWeek.getTime() + 6 * 24 * 3600 * 1000 >= validEndDate.getTime();

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
    if (prevDisabled) return;
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    if (nextDisabled) return;
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    let x = e.clientX;
    const popupWidth = 400;
    if (x + popupWidth / 2 > window.innerWidth) {
      x = window.innerWidth - popupWidth / 2 - 10;
    }
    setPopupPosition({ x, y: e.clientY });
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

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

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.header}>
        <h2>Interviews</h2>
        <p>The full interview schedule.</p>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Week</span>
            <button
              className={`${styles.controlButton} ${prevDisabled ? styles.disabled : ""}`}
              onClick={handlePrevWeek}
              disabled={prevDisabled}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M15,6 L9,12 L15,18" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button
              className={`${styles.controlButton} ${nextDisabled ? styles.disabled : ""}`}
              onClick={handleNextWeek}
              disabled={nextDisabled}
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M9,6 L15,12 L9,18" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
          <button
            className={`${styles.teamButton} ${fullTeam ? styles.teamButtonActive : ""}`}
            onClick={() => setFullTeam(!fullTeam)}
          >
            {fullTeam ? "Full Team: ON" : "Full Team: OFF"}
          </button>
        </div>
      </div>
      <div className={styles.calendarWrapper}>
        <div className={styles.leftSide}>
          <div className={styles.timeColumn}>
            {timeSlots.map((time, index) => (
              <div key={index} className={styles.timeCell}>
                {time}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.rightSide}>
          <div className={styles.calendarHeader}>
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
                                color: borderColor,
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
      </div>
      {selectedEvent && (
        <div ref={popupRef}>
          <EventDetails
            event={selectedEvent}
            popupPosition={popupPosition}
            onClose={closeEventDetails}
            onAttend={() => console.log("yippe")}
          />
        </div>
      )}
    </div>
  );
};

export default Calendar;
