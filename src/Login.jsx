import { supabase } from './supabaseClient';
import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setMsg('');

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('✅ Check your email for the login link!');
    }

    setIsLoading(false);
  };

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Sidebar */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-2 h-6 w-6"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          SilentAudit
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Monitor device activity with precision and ease.&rdquo;
            </p>
            <footer className="text-sm">Tarka Labs</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel (Login Form) */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to SilentAudit
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a login link
            </p>
          </div>

          <div className="grid gap-6">
            {/* Input Form */}
            <div className="grid gap-2">
              <label className="sr-only" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <button
                type="button"
                onClick={login}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Sending...' : 'Send Login Link'}
              </button>
            </div>

            {/* Status Message */}
            {msg && (
              <div
                role="status"
                aria-live="polite"
                className={`p-4 rounded-md text-sm ${
                  msg.includes('Check your email') || msg.includes('✅')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {msg}
              </div>
            )}
          </div>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
