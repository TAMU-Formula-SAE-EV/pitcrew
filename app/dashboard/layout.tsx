import Sidebar from "@/components/layout/Sidebar";
import styles from './layout.module.css';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // TODO: add authentication check here later
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>{children}</main>
        </div>
    );
}