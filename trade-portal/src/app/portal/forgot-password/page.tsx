import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/portal/auth-shell';
import { ForgotPasswordForm } from '@/components/portal/forgot-password-form';
import { getSecureSession } from '@/server/auth/session';
import { DASHBOARD_ROUTE_BY_SCOPE } from '@/lib/portal-config';

export default async function PortalForgotPasswordPage() {
  const session = await getSecureSession();
  if (session) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[session.scope]);
  }

  return (
    <AuthShell
      title="Reset your portal password."
      intro="Password reset is queued through BullMQ and delivered through the configured SMTP relay. Reset links are short-lived and single-use."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
