'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordAction } from '@/server/actions/public-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState = undefined;

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form className="space-y-4" action={action}>
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">New password</label>
        <Input name="password" type="password" minLength={10} required />
      </div>
      {state?.message ? (
        <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? 'Updating…' : 'Reset password'}
      </Button>
      <Link href="/portal" className="text-sm font-medium text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
