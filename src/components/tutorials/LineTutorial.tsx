import React from 'react';

const LineTutorial: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 max-h-[300px] overflow-y-auto">
      <h4 className="font-medium text-blue-800 mb-2">How to get your LINE tokens:</h4>
      <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
        <li>Go to <a href="https://developers.line.biz/console/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">LINE Developers Console</a></li>
        <li>Log in with your LINE account</li>
        <li>Select your LINE Official Account channel</li>
        <li>Go to the <strong>Basic settings</strong> tab and scroll down to find your <strong>Channel secret</strong></li>
        <li>Then go to the <strong>Messaging API</strong> tab and scroll down to find or issue a <strong>Channel access token</strong></li>
        <li>Copy these values and paste them in the form below</li>
      </ol>
      {/* <div className="mt-3">
        <img 
          src="/images/line-token-guide.png" 
          alt="LINE Token Guide" 
          className="w-full rounded border border-blue-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div> */}
    </div>
  );
};

export default LineTutorial; 