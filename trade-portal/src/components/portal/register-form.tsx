'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { registerCompanyAction } from '@/server/actions/public-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState = undefined;

export function RegisterForm() {
  const [companyType, setCompanyType] = useState<'BUYER' | 'SELLER'>('BUYER');
  const [state, action, pending] = useActionState(registerCompanyAction, initialState);

  return (
    <form className="space-y-4" action={action}>
      <input type="hidden" name="companyType" value={companyType} />
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Register buyer or seller</p>
        <div className="flex gap-2">
          {([
            ['BUYER', 'Buyer company'],
            ['SELLER', 'Seller company'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setCompanyType(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                companyType === value ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Company name</label>
          <Input name="companyName" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Work email</label>
          <Input name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">First name</label>
          <Input name="firstName" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Last name</label>
          <Input name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <Input name="password" type="password" minLength={10} required />
      </div>
      {state?.message ? (
        <p className={`rounded-xl px-3 py-2 text-sm ${state.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? 'Submitting…' : 'Submit registration'}
      </Button>
      <div className="text-sm text-slate-500">
        Already have credentials?{' '}
        <Link href="/portal" className="font-medium text-slate-900">
          Sign in
        </Link>
      </div>
    </form>
  );
}
