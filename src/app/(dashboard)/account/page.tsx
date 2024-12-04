import React from 'react';

interface IntegratedAccount {
  id: number;
  name: string;
  description: string;
  isConnected: boolean;
}

const integratedAccounts: IntegratedAccount[] = [
  {
    id: 1,
    name: 'Line',
    description: 'Connect your line account.',
    isConnected: true
  },
  {
    id: 2,
    name: 'Messenger',
    description: 'Connect your messenger account.',
    isConnected: true
  }
];

const AccountManagementPage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg w-full h-full p-6">
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
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Upload
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div className="mb-6">
        <p className="font-semibold text-lg">Full name</p>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            type="text"
            placeholder="First name"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Last name"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contact Email */}
      <div className="mb-6">
        <p className="font-semibold text-lg">Contact email</p>
        <input
          type="email"
          placeholder="Email address"
          className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg">
          Add another email
        </button>
      </div>

      {/* Password */}
      <div className="mb-6">
        <p className="font-semibold text-lg">Password</p>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <input
            type="password"
            placeholder="Current password"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="New password"
            className="p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Integrated Accounts */}
      <div className="mb-6">
        <p className="font-semibold text-lg">Integrated account</p>
        <ul className="mt-4 space-y-4">
          {integratedAccounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow"
            >
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-gray-500">{account.description}</p>
              </div>
              <button
                className={`px-4 py-2 rounded-lg ${
                  account.isConnected
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {account.isConnected ? 'Connected' : 'Connect'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AccountManagementPage;
