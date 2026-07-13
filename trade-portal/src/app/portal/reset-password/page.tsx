import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/portal/auth-shell';
import { ResetPasswordForm } from '@/components/portal/reset-password-form';
import { getSecureSession } from '@/server/auth/session';
import { DASHBOARD_ROUTE_BY_SCOPE } from '@/lib/portal-config';

export default async function PortalResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const session = await getSecureSession();
  if (session) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[session.scope]);
  }

  const token = (await searchParams).token;

  return (
    <AuthShell
      title="Complete the password reset."
      intro="Reset tokens are checked server-side against expiry and single-use rules before a new password is stored."
      secondary={!token ? <p className="text-sm text-red-600">A reset token is required in the URL query.</p> : undefined}
    >
      <ResetPasswordForm token={typeof token === 'string' ? token : ''} />
    </AuthShell>
  );
}
