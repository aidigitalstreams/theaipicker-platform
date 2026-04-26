'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-brand">AI Digital Streams</div>
        <h1 className="admin-login-title">Admin sign in</h1>
        <p className="admin-login-sub">Enter the admin password to continue.</p>

        <form action={formAction} className="admin-login-form">
          <label htmlFor="password" className="admin-login-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            className="admin-login-input"
          />
          {state?.error && <div className="admin-login-error">{state.error}</div>}
          <button type="submit" disabled={pending} className="admin-login-button">
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
