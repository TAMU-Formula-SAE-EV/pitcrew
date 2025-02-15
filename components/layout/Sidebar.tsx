"use client";
import Calendar from "@/public/icons/calendar.svg";
import CalendarActive from "@/public/icons/calendar-active.svg";
import Dashboard from "@/public/icons/dashboard.svg";
import DashboardActive from "@/public/icons/dashboard-active.svg";
import Logo from "@/public/icons/logo.svg";
import Mail from "@/public/icons/mail.svg";
import MailActive from "@/public/icons/mail-active.svg";
import MailNoti from "@/public/icons/mail-noti.svg";
import MailNotiActive from "@/public/icons/mail-noti-active.svg";
import Profile from "@/public/icons/profile.svg";
import ProfileActive from "@/public/icons/profile-active.svg";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from "./sidebar.module.css";

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/dashboard",
            icon: Dashboard,
            activeIcon: DashboardActive,
            label: "Dashboard",
        },
        {
            href: "/dashboard/calendar",
            icon: Calendar,
            activeIcon: CalendarActive,
            label: "Calendar",
        },
        {
            href: "/dashboard/profile",
            icon: Profile,
            activeIcon: ProfileActive,
            label: "Profile",
        }
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <aside className={styles.sidebar}>
            <Link href="/dashboard" className={styles.logo}>
                <Image
                    src={Logo}
                    alt="PitCrew Logo"
                    width={24}
                    height={24}
                />
            </Link>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                    >
                        {isActive(item.href) && (
                            <motion.div 
                                className={styles.activeIndicator}
                                layoutId="activeIndicator"
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                        )}
                        <Image
                            src={isActive(item.href) ? item.activeIcon : item.icon}
                            alt={item.label}
                            className={styles.icon}
                            width={17}
                            height={17}
                        />
                    </Link>
                ))}
            </nav>
        </aside>
    );
}