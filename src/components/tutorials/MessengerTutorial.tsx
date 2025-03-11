import React from 'react';

const MessengerTutorial: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200 max-h-[300px] overflow-y-auto">
      <h4 className="font-medium text-blue-800 mb-2">How to get your Messenger tokens:</h4>

      <div className="mb-4">
        <h5 className="font-medium text-blue-800 mb-1">Method 1: Using Graph API Explorer (Faster)</h5>
        <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
          <li>Go to <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Graph API Explorer</a></li>
          <li>Log in with your Facebook account</li>
          <li>Select your app from the dropdown menu</li>
          <li>Click on "Generate Access Token" button</li>
          <li>Select permissions: pages_show_list, pages_messaging, pages_read_engagement</li>
          <li>After generating the token, select your page from the dropdown</li>
          <li>Your Page ID will be displayed in the response when you run a query</li>
        </ol>
      </div>

      <div>
        <h5 className="font-medium text-blue-800 mb-1">Method 2: Standard approach</h5>
        <ol className="list-decimal pl-5 text-sm text-blue-800 space-y-1">
          <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Facebook for Developers</a></li>
          <li>Log in with your Facebook account</li>
          <li>Go to "My Apps" and select your app (or create a new one)</li>
          <li>Navigate to "Settings" {'>'} "Basic" to find your App ID</li>
          <li>Go to "Messenger" {'>'} "Settings" and scroll to "Access Tokens"</li>
          <li>Generate a token for your Facebook Page</li>
          <li>Your Page ID can be found in your Facebook Page URL: facebook.com/your_page_name/</li>
        </ol>
      </div>
      
      
      
      {/* <div className="mt-3">
        <img 
          src="/images/messenger-token-guide.png" 
          alt="Messenger Token Guide" 
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

export default MessengerTutorial;