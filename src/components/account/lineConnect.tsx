import * as React from 'react';
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
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

interface Request {
    requestOpen: boolean;
    onClose: () => void;  
}

export default function LineConnect({requestOpen,onClose}: Request) {
  return (
    <div>
      <Modal
        open={requestOpen}
        onClose={onClose}
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
    </div>
  );
}
