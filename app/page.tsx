import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div>
        <h1>Formula Electric Recruiting</h1>
        <p>Join our team and help build the future of electric racing.</p>
        
        <div>
          <Link href="/apply">Apply Now</Link>
          <Link href="/dashboard">Admin Login</Link>
        </div>
      </div>
    </main>
  );
}