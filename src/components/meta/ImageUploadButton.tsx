import React, { useRef } from 'react';
import { MetaMessage } from '@/app/(dashboard)/messenger/page';
import { MessageType } from '@/enum/enum';

interface ImageUploadButtonProps {
  selectedContact: {
    userId: string;
    displayName: string;
  } | null;
  onImageUpload: (message: MetaMessage) => void;
  onError: (message: string) => void;
  source?: 'line' | 'messenger';
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({
  selectedContact,
  onImageUpload,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    const tempImageUrl = URL.createObjectURL(file);

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      senderId: 'me',
      recipientId: selectedContact.userId,
      senderName: 'You',
      content: 'Sent an image',
      messageType: MessageType.OUTGOING,
      timestamp: new Date().toISOString(),
      isRead: true,
      contentType: 'image',
      imageUrl: tempImageUrl
    };
    onImageUpload(tempMessage);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('recipientId', selectedContact.userId);
    formData.append('content', 'Sent an image');

    try {
      const endpoint = '/api/meta/messages/images';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to send image');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      onError(
        `Failed to send image. Your token might have expired. Please try reconnecting your Meta account.`
      );
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      <button
        className="p-2 text-blue-500 hover:text-blue-700"
        onClick={handleImageSelect}
        title="Upload image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>
    </>
  );
};

export default ImageUploadButton;
