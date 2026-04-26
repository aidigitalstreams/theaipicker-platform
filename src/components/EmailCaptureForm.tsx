'use client';

import { useState } from 'react';

interface Props {
  source: 'comparison-builder' | 'free-tools' | 'newsletter' | 'other';
  context?: string;
  heading?: string;
  description?: string;
  buttonLabel?: string;
  variant?: 'card' | 'inline';
  onDismiss?: () => void;
}

type Status = 'idle' | 'sending' | 'success' | 'already' | 'error';

export default function EmailCaptureForm({
  source,
  context,
  heading = 'Save this for later',
  description = 'Get this comparison and future updates by email. No spam — unsubscribe any time.',
  buttonLabel = 'Send it to me',
  variant = 'card',
  onDismiss,
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, context }),
      });
      const data: { ok?: boolean; alreadySubscribed?: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Try again.');
        return;
      }
      setStatus(data.alreadySubscribed ? 'already' : 'success');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Try again.');
    }
  }

  if (status === 'success' || status === 'already') {
    return (
      <div className={`email-capture email-capture-${variant} email-capture-success`}>
        <h3 className="email-capture-heading">
          {status === 'already' ? "You're already on the list" : 'Done — check your inbox'}
        </h3>
        <p className="email-capture-description">
          {status === 'already'
            ? 'No need to re-subscribe. Future updates will land in your inbox.'
            : 'We saved your email. You can unsubscribe any time from any future message.'}
        </p>
        {onDismiss && (
          <button type="button" onClick={onDismiss} className="email-capture-dismiss">
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`email-capture email-capture-${variant}`}>
      <div className="email-capture-body">
        <h3 className="email-capture-heading">{heading}</h3>
        <p className="email-capture-description">{description}</p>
        <form onSubmit={handleSubmit} className="email-capture-form">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={status === 'sending'}
            className="email-capture-input"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="email-capture-button"
          >
            {status === 'sending' ? 'Saving…' : buttonLabel}
          </button>
        </form>
        {status === 'error' && (
          <p className="email-capture-error">{errorMessage}</p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="email-capture-close"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
