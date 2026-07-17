import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/portal/auth-shell';
import { SignInForm } from '@/components/portal/sign-in-form';
import { getSecureSession } from '@/server/auth/session';
import { DASHBOARD_ROUTE_BY_SCOPE } from '@/lib/portal-config';

export default async function PortalSignInPage() {
  const session = await getSecureSession();
  if (session) {
    redirect(DASHBOARD_ROUTE_BY_SCOPE[session.scope]);
  }

  return (
    <AuthShell
      title="Private trade workspace for inquiries, sourcing, payments, logistics, and documents."
      intro="Use approved company credentials only. Buyer, seller, and internal routes are scoped by role; payment gateway events and carrier milestones are simulated/manual in this internal review build."
      secondary={
        <div className="space-y-2 text-sm leading-7 text-slate-600">
          <p className="font-medium text-slate-900">Internal access policy</p>
          <p>Only approved review users should sign in. Buyer, seller, and internal operations views are separated by company and role.</p>
          <p>Real gateway keys, carrier APIs, and production credentials stay out of this environment until final approval.</p>
        </div>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
