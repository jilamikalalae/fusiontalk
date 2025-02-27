'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import NewPassword from '@/components/account/newPassword';
import LinearProgress from '@mui/material/LinearProgress';

import LineConnect from '@/components/account/lineConnect';
import MessengerConnect from '@/components/account/messengerConnect';

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
          isMessengerConnected: data.isMessengerConnected || false
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

  const handleConnectionLine = (isConnected: boolean) => {
    setUserProfile((prev) => ({
      ...prev,
      isLineConnected: isConnected
    }));
  };

  const handleConnectionMessenger = (isConnected: boolean) => {
    setUserProfile((prev) => ({
      ...prev,
      isMessengerConnected: isConnected
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <LinearProgress className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="container mx-auto px-4 py-8">
      

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg w-full mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{userProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-500">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-500">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, email: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg mt-1"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white shadow rounded-lg w-full mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Password</h2>
          </div>
          <div className="p-6">
            <NewPassword />
          </div>
        </div>

        {/* Integrated Accounts */}
        <div className="bg-white shadow rounded-lg w-full mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Integrated Accounts</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-medium text-lg">Line</h3>
                  <p className="text-sm text-gray-500">Connect your Line account to chat with your Line contacts.</p>
                </div>
                <LineConnect
                  className={`px-4 py-2 rounded-lg border-2 text-center ${
                    userProfile.isLineConnected
                      ? 'border-red-500 text-red-500 bg-white'
                      : 'border-gray-300 text-gray-700 bg-white'
                  }`}
                  onConnectionChange={handleConnectionLine}
                  isConnected={userProfile.isLineConnected}
                >
                  {userProfile.isLineConnected ? 'Unlink' : 'Link'}
                </LineConnect>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-medium text-lg">Messenger</h3>
                  <p className="text-sm text-gray-500">Connect your Messenger account to chat with your Facebook friends.</p>
                </div>
                <MessengerConnect
                  className={`px-4 py-2 rounded-lg border-2 text-center ${
                    userProfile.isMessengerConnected
                      ? 'border-red-500 text-red-500 bg-white'
                      : 'border-gray-300 text-gray-700 bg-white'
                  }`}
                  onConnectionChange={handleConnectionMessenger}
                  isConnected={userProfile.isMessengerConnected}
                >
                  {userProfile.isMessengerConnected ? 'Unlink' : 'Link'}
                </MessengerConnect>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security */}
        <div className="bg-white shadow rounded-lg w-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Account Security</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => signOut()}
                className="px-6 py-3 border border-gray-300 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage;
