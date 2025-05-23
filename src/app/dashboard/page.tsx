import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login'); // force redirect if not logged in
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {session?.user?.email}</h1>
      <p>This is your admin dashboard.</p>

      {/* Later: show bookings here */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Upcoming Bookings</h2>
        <p>(Coming soon...)</p>
      </div>
    </div>
  );
}
