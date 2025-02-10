import Link from "next/link"

export default function Dashboard(){
    return (
        <main>
            <div>
                <h1>Admin Dashboard</h1>
                <p>Manage applications and teams</p>
                <div>
                    <Link href="/dashboard/applications">Applications</Link>
                    <Link href="/dashboard/teams">Teams</Link>
                </div>
            </div>
        </main>
    )
}