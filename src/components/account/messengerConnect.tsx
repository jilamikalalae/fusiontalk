import * as React from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 4
};

interface MessengerConnectProps {
  className?: string;
  children?: React.ReactNode;
  onConnectionChange?: (connected: boolean) => void;
  isConnected?: boolean;
}

export default function MessengerConnect({
  className,
  children,
  onConnectionChange,
  isConnected
}: MessengerConnectProps) {
  const [open, setOpen] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const [pageId, setPageId] = React.useState('');
  const [error, setError] = React.useState('');
  const [unlinkConfirm, setUnlinkConfirm] = React.useState(false);
  const [connectionTime, setConnectionTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Check if there is a saved connection time
    const savedTime = localStorage.getItem('messengerConnectionTime');
    if (savedTime) {
      setConnectionTime(Number(savedTime));
      checkTokenExpiration(Number(savedTime));
    }
  }, []);

  const checkTokenExpiration = (time: number) => {
    const now = Date.now();
    const elapsedTime = now - time;
    const hoursPassed = elapsedTime / (1000 * 60 * 60); // Convert ms to hours

    if (hoursPassed >= 24) {
      setError('Access token has expired. Please type again.');
      handleUnlink(); // Automatically unlink if expired
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (connectionTime) {
      checkTokenExpiration(connectionTime);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAccessToken('');
    setPageId('');
    setError('');
    setUnlinkConfirm(false);
  };

  const handleConnect = async () => {
    if (!accessToken || !pageId) {
      setError('Both fields are required.');
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

      // Save connection timestamp
      localStorage.setItem('messengerConnectionTime', Date.now().toString());
      setConnectionTime(Date.now());

      if (onConnectionChange) {
        onConnectionChange(true);
      }
      handleClose();
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

      // Remove saved connection time
      localStorage.removeItem('messengerConnectionTime');
      setConnectionTime(null);

      if (onConnectionChange) {
        onConnectionChange(false);
      }
      handleClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className={className || 'px-4 py-2 rounded-lg border-1'}
      >
        {children}
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {!isConnected ? (
            <>
              <Typography variant="h6" component="h2" mb={2}>
                Connect Messenger Account
              </Typography>
              <Button variant="outlined" href="https://developers.facebook.com/tools/explorer/" target="_blank">
                Generate Access Token
              </Button>

              <TextField
                fullWidth
                label="Access Token"
                variant="outlined"
                margin="normal"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />

              <TextField
                fullWidth
                label="Page Id"
                variant="outlined"
                margin="normal"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
              />

              {error && <Typography color="error">{error}</Typography>}
              <Button
                onClick={handleConnect}
                variant="contained"
                color="primary"
                fullWidth
              >
                Connect
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" component="h2" mb={2}>
                Unlink Messenger Account
              </Typography>
              <Typography mb={3}>
                Are you sure you want to unlink your Messenger account?
              </Typography>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleClose}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnlink}
                  variant="contained"
                  color="error"
                >
                  Unlink
                </Button>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
