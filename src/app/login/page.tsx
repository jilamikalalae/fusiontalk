"use client";

import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Correct `useRouter` import for app directory

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter(); // This should now work

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent automatic redirection
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/"); // Redirect to the home page on success
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="text-right">
            <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
            Sign In
          </Button>
        </form>

        <div className="text-center mt-6 text-sm">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
