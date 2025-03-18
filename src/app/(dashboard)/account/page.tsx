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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Add state for unlink modals
  const [isLineUnlinkModalOpen, setIsLineUnlinkModalOpen] = useState(false);
  const [isMessengerUnlinkModalOpen, setIsMessengerUnlinkModalOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== userProfile.email) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch('/api/users', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      // Sign out and redirect to login page
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Error deleting account:', error);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Add unlink handlers
  const handleUnlinkLine = async () => {
    try {
      setIsUnlinking(true);
      const response = await fetch('/api/users/line-connect', {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlink LINE account');
      }

      handleConnectionLine(false);
      setIsLineUnlinkModalOpen(false);
    } catch (error) {
      console.error('Error unlinking LINE account:', error);
      // Show error in UI if needed
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleUnlinkMessenger = async () => {
    try {
      setIsUnlinking(true);
      const response = await fetch('/api/users/messenger-connect', {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlink Messenger account');
      }

      handleConnectionMessenger(false);
      setIsMessengerUnlinkModalOpen(false);
    } catch (error) {
      console.error('Error unlinking Messenger account:', error);
      // Show error in UI if needed
    } finally {
      setIsUnlinking(false);
    }
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
                      ? 'border-red-500 text-red-500 bg-white hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  onConnectionChange={(isConnected) => {
                    if (!isConnected) {
                      setIsLineUnlinkModalOpen(true);
                    } else {
                      handleConnectionLine(true);
                    }
                  }}
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
                      ? 'border-red-500 text-red-500 bg-white hover:bg-red-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  onConnectionChange={(isConnected) => {
                    if (!isConnected) {
                      setIsMessengerUnlinkModalOpen(true);
                    } else {
                      handleConnectionMessenger(true);
                    }
                  }}
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
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-3 border border-red-500 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
              >
                Delete my account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Delete Account</h3>
              <p className="mb-4 text-gray-700">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <p className="mb-6 text-gray-700">
                Please type <span className="font-medium">{userProfile.email}</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmation('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
                  disabled={deleteConfirmation !== userProfile.email || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LINE Unlink Modal */}
        {isLineUnlinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Unlink LINE Account</h3>
              <p className="mb-6 text-gray-700">
                Are you sure you want to unlink your LINE account? You will no longer be able to receive or send messages through LINE until you link it again.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsLineUnlinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={isUnlinking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlinkLine}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
                  disabled={isUnlinking}
                >
                  {isUnlinking ? 'Unlinking...' : 'Unlink'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messenger Unlink Modal */}
        {isMessengerUnlinkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold mb-4">Unlink Messenger Account</h3>
              <p className="mb-6 text-gray-700">
                Are you sure you want to unlink your Messenger account? You will no longer be able to receive or send messages through Messenger until you link it again.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsMessengerUnlinkModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={isUnlinking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnlinkMessenger}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
                  disabled={isUnlinking}
                >
                  {isUnlinking ? 'Unlinking...' : 'Unlink'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagementPage;
