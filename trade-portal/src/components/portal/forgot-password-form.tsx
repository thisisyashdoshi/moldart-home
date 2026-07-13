'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction } from '@/server/actions/public-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState = undefined;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form className="space-y-4" action={action}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Work email</label>
        <Input name="email" type="email" required />
      </div>
      {state?.message ? <p className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700">{state.message}</p> : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>
      <Link href="/portal" className="text-sm font-medium text-slate-900">
        Back to sign in
      </Link>
    </form>
  );
}
