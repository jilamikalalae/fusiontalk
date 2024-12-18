'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { PencilLine } from 'lucide-react';

import LineConnect from '@/components/account/lineConnect';

const AccountManagementPage: React.FC = () => {
  const { data: session } = useSession();

  // Redirect to login if not authenticated
  if (!session) redirect('/login');

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    isLineConnected: false,
    isMessengerConnected: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserProfile({
          name: data.name || '',
          email: data.email || '',
          isLineConnected: data.isLineConnected || false,
          isMessengerConnected: data.isMessengerConnect || false
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleConnectionLine = (connected: boolean) => {
    setUserProfile((prev) => ({ ...prev, isLineConnected: connected }));
  };

  const handleConnectionMessenger = (connected: boolean) => {
    setUserProfile((prev) => ({ ...prev, isMessengerConnected: connected }));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6">
      {/* Profile Picture */}
      <div className="flex items-center space-x-6 mb-6">
        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
          <img
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-lg">Profile picture</p>
          <p className="text-sm text-gray-500">PNG, JPEG under 15MB</p>
          <div className="mt-2 flex space-x-2">
            <button className="px-4 py-2  bg-gray-300 text-blue-500 rounded-lg">
              Upload
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <p className="font-semibold text-lg">Name</p>
        <input
          type="text"
          value={userProfile.name}
          readOnly
          placeholder="Name"
          className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contact Email */}
      <div>
        <p className="font-semibold text-lg">Contact email</p>
        <input
          type="email"
          value={userProfile.email}
          readOnly
          placeholder="Email address"
          className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <p className="font-semibold text-lg">Password</p>
        <div className="relative">
          <input
            type="password"
            placeholder="Current password"
            className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
            <PencilLine size={20} className="text-gray-500" />
          </div>
        </div>
      </div>
      
      {/* Integrated Accounts */}
      <div>
        <p className="font-semibold text-lg">Integrated accounts</p>
        <ul className="mt-4 space-y-4">
          <li className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow">
            <div>
              <p className="font-medium">Line</p>
              <p className="text-sm text-gray-500">
                Connect your Line account.
              </p>
            </div>
            <LineConnect
              className={`px-4 py-2 rounded-lg border-2 ${
                userProfile.isLineConnected
                  ? 'border-red-500 text-red-500 bg-white'
                  : 'border-gray-300 text-gray-700 bg-white'
              }`}
              onConnectionChange={handleConnectionLine}
              isConnected={userProfile.isLineConnected}
            >
              {userProfile.isLineConnected ? 'Unlink' : 'Link'}
            </LineConnect>
          </li>
        </ul>
        <ul className="mt-4 space-y-4">
          <li className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow">
            <div>
              <p className="font-medium">Messenger</p>
              <p className="text-sm text-gray-500">
                Connect your Messenger account.
              </p>
            </div>
            <LineConnect
              className={`px-4 py-2 rounded-lg border-2 ${
                userProfile.isMessengerConnected
                  ? 'border-green-500 text-green-500 bg-white'
                  : 'border-gray-300 text-gray-700 bg-white'
              }`}
              onConnectionChange={handleConnectionMessenger}
              isConnected={userProfile.isLineConnected}
            >
              {userProfile.isMessengerConnected ? 'Unlink' : 'Link'}
            </LineConnect>
          </li>
        </ul>
      </div>

      {/* Account Security */}
      <div>
        <p className="font-semibold text-lg">Account Security</p>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => signOut()}
            className="px-4 py-2 border-2 border-gray-300 bg-white text-black rounded-lg"
          >
            Log out
          </button>
          <button className="px-4 py-2 bg-white text-red-600 rounded-lg shadow-lg">
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
