'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PortalHealth = {
  ok: boolean;
  authReady: boolean;
  services: {
    database: boolean;
    redis: boolean;
    storage: boolean;
  };
};

function serviceLabel(value: boolean) {
  return value ? 'Ready' : 'Offline';
}

export function SignInForm() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<'buyer' | 'seller'>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [health, setHealth] = useState<PortalHealth | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  async function loadHealth() {
    setCheckingHealth(true);
    try {
      const response = await fetch('/api/portal/health', { cache: 'no-store' });
      const payload = (await response.json()) as PortalHealth;
      setHealth(payload);
    } catch {
      setHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function readInitialHealth() {
      try {
        const response = await fetch('/api/portal/health', { cache: 'no-store' });
        const payload = (await response.json()) as PortalHealth;
        if (!cancelled) setHealth(payload);
      } catch {
        if (!cancelled) setHealth(null);
      } finally {
        if (!cancelled) setCheckingHealth(false);
      }
    }

    void readInitialHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const authReady = Boolean(health?.authReady);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!authReady) {
      setError('Portal services are still starting. Wait until database, Redis, and storage show ready, then try again.');
      await loadHealth();
      return;
    }

    setPending(true);

    const result = await signIn('credentials', {
      email,
      password,
      portalType,
      redirect: false,
      callbackUrl: '/portal',
    });

    setPending(false);

    if (!result?.ok) {
      setError('Access was not opened. Check the email/password, company approval, and whether this account belongs to the selected buyer or seller lane.');
      return;
    }

    router.push('/portal');
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className={`rounded-2xl border px-4 py-3 text-sm ${authReady ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            {checkingHealth ? 'Checking secure services' : authReady ? 'Secure services ready' : 'Services not ready'}
          </span>
          <button type="button" onClick={loadHealth} className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4">
            <RefreshCw className="h-3.5 w-3.5" />
            Check
          </button>
        </div>
        {health ? (
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
            <span>Database: {serviceLabel(health.services.database)}</span>
            <span>Redis: {serviceLabel(health.services.redis)}</span>
            <span>Storage: {serviceLabel(health.services.storage)}</span>
          </div>
        ) : (
          <p className="mt-2 text-xs">Health endpoint unavailable. Start local portal services before login.</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Choose the workspace lane</p>
        <div className="grid grid-cols-2 gap-2">
          {(['buyer', 'seller'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPortalType(value)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-medium ${
                portalType === value ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="block">{value === 'buyer' ? 'Buyer' : 'Seller'}</span>
              <span className="mt-1 block text-xs opacity-70">{value === 'buyer' ? 'RFQs, quotes, orders' : 'Inquiries, offers, execution'}</span>
            </button>
          ))}
        </div>
        <p className="text-xs leading-5 text-slate-500">Internal admin accounts route automatically after sign-in.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Work email</label>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
      </div>
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" disabled={pending || checkingHealth || !authReady} type="submit">
        {pending ? 'Opening workspace…' : !authReady ? 'Waiting for portal services' : 'Open portal'}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <Link href="/portal/register" className="font-medium text-slate-900">
          Request company access
        </Link>
        <Link href="/portal/forgot-password" className="font-medium text-slate-900">
          Forgot password
        </Link>
      </div>
    </form>
  );
}
