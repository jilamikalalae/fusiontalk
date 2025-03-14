import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import MessengerTutorial from '@/components/tutorials/MessengerTutorial';
import { Label } from '@/components/ui/label';

interface MessengerConnectProps {
  children: React.ReactNode;
  className?: string;
  onConnectionChange: (isConnected: boolean) => void;
  isConnected: boolean;
}

const MessengerConnect: React.FC<MessengerConnectProps> = ({
  children,
  className,
  onConnectionChange,
  isConnected
}) => {
  const [showForm, setShowForm] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  const toggleForm = () => setShowForm(!showForm);
  const toggleTutorial = () => setShowTutorial(!showTutorial);

  const handleConnect = async () => {
    if (!accessToken || !pageId) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('/api/users/messenger-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, pageId })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Connection failed.');
        return;
      }

      if (onConnectionChange) {
        onConnectionChange(true);
      }
      toggleForm();
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleUnlink = async () => {
    try {
      const response = await fetch('/api/users/messenger-connect', {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Unlink failed.');
        return;
      }

      if (onConnectionChange) {
        onConnectionChange(false);
      }
      toggleForm();
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <Button
        onClick={toggleForm}
        className={className}
        variant={isConnected ? 'destructive' : 'outline'}
      >
        {children}
      </Button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Connect Messenger Account</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Enter your Facebook Page Access Token and Page ID to connect your Messenger account.
              </p>
              <button 
                onClick={toggleTutorial}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to get your Messenger tokens?
              </button>
            </div>
            
            {showTutorial && <MessengerTutorial />}

            <div className="space-y-4 mt-4">
              <div className="mb-4">
                <Label htmlFor="pageId" className="block text-sm font-medium text-gray-700 mb-1">
                  Page ID
                </Label>
                <Input
                  id="pageId"
                  type="text"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  placeholder="Enter your Facebook Page ID"
                  className="w-full px-4 py-2 mt-1"
                />
              </div>

              <div className="mb-4">
                <Label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-1">
                  Page Access Token
                </Label>
                <Input
                  id="accessToken"
                  type="text"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your Facebook Page Access Token"
                  className="w-full px-4 py-2 mt-1"
                />
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p>{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  onClick={handleConnect}
                  isLoading={loading}
                  loadingText="Connecting..."
                >
                  Connect
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerConnect;
