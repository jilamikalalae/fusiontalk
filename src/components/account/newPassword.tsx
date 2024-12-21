import React, { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import { ChevronRight } from 'lucide-react';

export default function ChangePasswordDialog() {
  const [open, setOpen] = React.useState(false);
  const [logoutOtherDevices, setLogoutOtherDevices] = React.useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      password: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      checkPassword: formData.get('retypeNewPassword'),
    };

    if (data.newPassword !== data.checkPassword) {
      setErrorMessage("New passwords don't match.");
      return;
    }

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to change password.');
        return;
      }

      setSuccessMessage('Password changed successfully.');
      setTimeout(handleClose, 2000); // Close dialog after success
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage('Something went wrong. Please try again.');
    }
  };


  return (
    <React.Fragment>
      {/* <Button variant="outlined" onClick={handleClickOpen} >
        Change Password
      </Button> */}
      <div>
        <button
          className="mt-2 w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleClickOpen}
        >
          <p className="text-left">Change password</p>
        </button>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
          <ChevronRight size={20} className="text-gray-500" />
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Your password must be at least 6 characters and should include a
            combination of numbers, letters, and special characters (!@$%^&*).
          </Typography>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          {successMessage && (
            <Typography color="success">{successMessage}</Typography>
          )}

          <TextField
            required
            fullWidth
            margin="dense"
            id="currentPassword"
            name="currentPassword"
            label="Current password"
            type="password"
            variant="outlined"
            // helperText="Updated 04/20/2024"
          />
          <TextField
            required
            fullWidth
            margin="dense"
            id="newPassword"
            name="newPassword"
            label="New password"
            type="password"
            variant="outlined"
          />
          <TextField
            required
            fullWidth
            margin="dense"
            id="retypeNewPassword"
            name="retypeNewPassword"
            label="Re-type new password"
            type="password"
            variant="outlined"
          />
          <Link
            href="#"
            variant="body2"
            sx={{ display: 'block', mt: 1, mb: 2 }}
          >
            Forgot your password?
          </Link>
          <FormControlLabel
            control={
              <Checkbox
                checked={logoutOtherDevices}
                onChange={(event) =>
                  setLogoutOtherDevices(event.target.checked)
                }
              />
            }
            label="Log out of other devices. Choose this if someone else used your account."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
