"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import bg1 from "@/app/login/bg1.webp";
import React, { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }
  
    try {
      const res = await fetch('api/register', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
  
      if (res.ok) {
        // Explicitly cast e.target to HTMLFormElement
        const form = e.target as HTMLFormElement;
        form.reset(); // This will work now
      } else {
        console.log("Registration failed.");
      }
    } catch (error) {
      console.log("Error during registration:", error);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side: Background image */}
      <div className="relative">
        <Image
          src={bg1}
          alt="Background Image"
          fill
          className="object-cover"
        />
      </div>

      {/* Right side: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Create an account</h1>

          <form className="space-y-4">
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
                onChange={(e) => setName(e.target.value)}
                id="full-name"
                placeholder="Enter your full name"
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
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                placeholder="Enter your email"
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
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                placeholder="Create a password"
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {error && (
              <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                {error}
              </div>
            )}
            {/* Submit Button */}
            <Button className="w-full bg-blue-500 text-white hover:bg-blue-600">
              Sign Up
            </Button>
          </form>

          {/* Terms and Conditions */}

          {/* Login Redirect */}
          <div className="text-center mt-6 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
