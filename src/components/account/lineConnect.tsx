import * as React from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button
} from '@mui/material';

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

interface LineConnectProps {
  className?: string;
  children?: React.ReactNode;
  onConnectionChange?: (connected: boolean) => void;
  isConnected?: boolean;
}

export default function LineConnect({ 
  className, 
  children, 
  onConnectionChange,
  isConnected 
}: LineConnectProps) {
  const [open, setOpen] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState('');
  const [secretToken, setSecretToken] = React.useState('');
  const [error, setError] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setAccessToken('');
    setSecretToken('');
    setError('');
  };

  const handleConnect = async () => {
    if (!accessToken || !secretToken) {
      setError("Both fields are required.");
      return;
    }

    try {
      const response = await fetch('/api/line-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, secretToken })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Connection failed.');
        return;
      }

      if (onConnectionChange) {
        onConnectionChange(true);
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
        className={className || "px-4 py-2 rounded-lg border-2"}
      >
        {children}
      </button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2" mb={2}>
            Connect Line Official Account
          </Typography>
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
            label="Secret Token"
            variant="outlined"
            margin="normal"
            value={secretToken}
            onChange={(e) => setSecretToken(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" mt={2}>
              {error}
            </Typography>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleConnect}
            sx={{ mt: 2 }}
          >
            Connect
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            fullWidth 
            onClick={handleClose}
            sx={{ mt: 2 }}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

