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
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConnect = () => {
    // Add your Line connection logic here
    if (onConnectionChange) {
      onConnectionChange(true);
    }
    handleClose();
  };

  return (
    <div>
      <button 
        onClick={handleOpen}
        className={className || "px-4 py-2 rounded-lg border-2 border-green-500 text-green-500 bg-white"}
      >
        {children || (isConnected ? "Connected" : "Connect")}
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Connect your Line Official Account
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your channel access token"
              type="text"
              variant="outlined"
              margin="normal"
            />
            <TextField
              fullWidth
              label="Your channel secret token"
              type="text"
              variant="outlined"
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleConnect}
            >
              Connect
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
