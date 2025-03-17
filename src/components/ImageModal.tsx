interface ImageModalProps {
    isOpen: boolean;
    imageUrl: string | null;
    onClose: () => void;
  }
  
  const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen || !imageUrl) return null;
  
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div className="relative max-w-4xl max-h-screen p-4">
          <button
            className="absolute top-2 right-2 bg-white rounded-full p-2 text-black"
            onClick={onClose}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={imageUrl}
            alt="Enlarged message attachment"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </div>
    );
  };
  
  export default ImageModal;