'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import bg1 from '@/app/login/bg1.webp';
import React, { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: session } = useSession();

  if (session) redirect('/');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/register/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const response = await res.json();
      if (res.ok) {
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('User registered successfully!');
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Background image */}
      <div className="relative">
        <Image src={bg1} alt="Background Image" fill className="object-cover" />
      </div>

      {/* Right side: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Create an account
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="full-name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full-name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500 text-white text-sm py-2 px-4 rounded-md">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Sign Up
            </Button>
          </form>

          {/* Login Redirect */}
          <div className="text-center mt-6 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500">
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
