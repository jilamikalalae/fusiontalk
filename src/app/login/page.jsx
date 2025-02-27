'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LoadingButton } from '@/components/ui/loading-button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { data: session } = useSession();

  if (session) router.replace('/');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false // Prevent automatic redirection
      });

      if (res.error) {
        setError('Your email or password is incorrect.'); // Show error message
      } else {
        router.replace('account'); // Redirect to the `/account` page
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          {error && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <LoadingButton
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </LoadingButton>
        </form>

        {/* Opt-Out Checkbox */}

        {/* Terms and Privacy */}

        {/* Register Redirect */}
        <div className="text-center mt-6 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-500">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
