import Link from 'next/link';
import BackButton from './_components/BackButton';
import StreamSelector from './_components/StreamSelector';
import { logoutAction } from '../login/actions';
import { listStreams, getActiveStreamId } from '@/lib/streams';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [streams, activeStreamId] = await Promise.all([
    listStreams(),
    getActiveStreamId(),
  ]);
  return (
    <div className="admin-shell admin-shell-dark">
      <header className="admin-header">
        <div className="admin-header-left">
          <BackButton />
          <Link href="/admin" className="admin-header-brand">
            AI Digital Streams
            <span className="small">Admin</span>
          </Link>
        </div>
        <div className="admin-header-right">
          <StreamSelector streams={streams} activeStreamId={activeStreamId} />
          <form action={logoutAction}>
            <button type="submit" className="admin-header-signout">Sign out</button>
          </form>
        </div>
      </header>

      <div className="admin-main">{children}</div>
    </div>
  );
}
