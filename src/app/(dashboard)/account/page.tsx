'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import NewPassword from '@/components/account/newPassword';
import LinearProgress from '@mui/material/LinearProgress';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users/v2', { method: 'GET' });
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ name: userProfile.name, email: userProfile.email });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ name: '', email: '' });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update user data');
      }

      await response.json();

      setUserProfile((prev) => ({
        ...prev,
        name: editedProfile.name,
        email: editedProfile.email
      }));
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const handleConnectionLine = (connected: boolean) => {
    setUserProfile((prev) => ({ ...prev, isLineConnected: connected }));
  };

  const handleConnectionMessenger = (connected: boolean) => {
    setUserProfile((prev) => ({ ...prev, isMessengerConnected: connected }));
  };

  return (
    <div>
      <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="object-contain"
            />
          </div>

          <div className="flex-1 flex justify-end">
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 border-2 border-red-500 text-red-500 bg-white rounded-lg"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <p className="font-semibold text-lg">Name</p>
          <input
            type="text"
            value={isEditing ? editedProfile.name : userProfile.name}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            readOnly={!isEditing}
            placeholder="Name"
            className={`mt-2 w-full p-3 border rounded-lg outline-none ${
              isEditing ? 'focus:ring-2 focus:ring-blue-500' : ''
            }`}
          />
        </div>

        {/* Contact Email */}
        <div>
          <p className="font-semibold text-lg">Contact email</p>
          <input
            type="email"
            value={isEditing ? editedProfile.email : userProfile.email}
            onChange={(e) =>
              setEditedProfile((prev) => ({ ...prev, email: e.target.value }))
            }
            readOnly={!isEditing}
            placeholder="Email address"
            className={`mt-2 w-full p-3 border rounded-lg outline-none ${
              isEditing ? 'focus:ring-2 focus:ring-blue-500' : ''
            }`}
          />
        </div>

        {/* Save and Cancel Buttons */}
        {isEditing && (
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-black rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Password */}
      <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6 mt-10">
        <p className="font-semibold text-lg">Password</p>
        <div className="relative">
          <NewPassword />
        </div>
      </div>

      {/* Integrated Accounts */}
      <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6 mt-10">
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
      <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6 mt-10">
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
