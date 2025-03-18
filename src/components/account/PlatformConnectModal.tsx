import React from 'react';
import { useRouter } from 'next/navigation';

interface PlatformConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'LINE' | 'Messenger';
}

const PlatformConnectModal: React.FC<PlatformConnectModalProps> = ({
  isOpen,
  onClose,
  platform
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    router.push('/account');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">{platform} Connection Required</h3>
        <p className="mb-6 text-gray-700">
          Please connect your {platform} account to access the chat features. Would you like to go to the account settings page?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleGoToSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformConnectModal; 