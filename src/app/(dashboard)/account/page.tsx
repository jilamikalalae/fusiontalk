"use client";

import React, { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';

import LineConnect from '@/components/account/lineConnect';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  SxProps,
  Theme
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4
} as SxProps<Theme>;

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
    isConnected: false
  },
  {
    id: 2,
    name: 'Messenger',
    description: 'Connect your messenger account.',
    isConnected: true
  }
];

const AccountManagementPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    app: true
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const toggleNotification = (type: 'email' | 'sms' | 'app') => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const { data: session } = useSession();
  
  if (!session) redirect("/login");


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="bg-white shadow-lg rounded-lg w-full h-full p-6 space-y-6">
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
            <button className="px-4 py-2 border-2 border-blue-500 bg-white text-black rounded-lg">
              Upload
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
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
      <div>
        <p className="font-semibold text-lg">Contact email</p>
        <input
          type="email"
          placeholder="Email address"
          className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-3 px-4 py-2 border-2 border-gray-300 bg-white text-black  rounded-lg">
          Add another email
        </button>
      </div>

      {/* Password */}
      <div>
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
      <div>
        <p className="font-semibold text-lg">Integrated accounts</p>
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
                onClick={handleOpen}
                className={`px-4 py-2 rounded-lg border-2 ${
                  account.isConnected
                    ? 'border-gray-300 text-gray-700 bg-white'
                    : 'border-green-500 text-green-500 bg-white'
                }`}
              >
                {account.isConnected ? 'Connected' : 'Connect'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Account Security */}
      <div>
        <p className="font-semibold text-lg">Account Security</p>
        <div className="mt-4 flex space-x-4">
          <button onClick={() => signOut()} className="px-4 py-2 border-2 border-gray-300 bg-white text-black rounded-lg">
            Log out
          </button>
          <button className="px-4 py-2 bg-white text-red-600 rounded-lg shadow-lg">
            Delete my account
          </button>
        </div>
      </div>
      <LineConnect requestOpen={open} onClose={handleClose}/>
      {/* <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-title" variant="h6" component="h2">
              Sign in to our platform
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Your email"
                type="email"
                variant="outlined"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Your password"
                type="password"
                variant="outlined"
                margin="normal"
              />
              <FormControlLabel control={<Checkbox />} label="Remember me" />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1
                }}
              >
                <Link href="#" underline="hover">
                  Lost Password?
                </Link>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Login to your account
              </Button>
              <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                Not registered?{' '}
                <Link href="#" underline="hover">
                  Create account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Modal>
      </div> */}
    </div>
  );
};

export default AccountManagementPage;
