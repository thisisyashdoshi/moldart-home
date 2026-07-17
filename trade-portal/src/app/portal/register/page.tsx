import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/portal/auth-shell';
import { RegisterForm } from '@/components/portal/register-form';
import { getSecureSession } from '@/server/auth/session';
import { DASHBOARD_ROUTE_BY_SCOPE } from '@/lib/portal-config';

export default async function PortalRegisterPage() {
  const session = await getSecureSession();
  if (session) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[session.scope]);
  }

  return (
    <AuthShell
      title="Register a buyer or seller company."
      intro="Registration creates a pending company, pending user, and primary role assignment. Internal ops approval and email verification complete the onboarding chain."
      secondary={<p className="text-sm leading-7 text-slate-600">Public registration only supports buyer and seller companies. Internal ops and admin users are provisioned privately.</p>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
