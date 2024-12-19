import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function ChangePasswordDialog() {
  const [open, setOpen] = React.useState(false);
  const [logoutOtherDevices, setLogoutOtherDevices] = React.useState(true);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      retypeNewPassword: formData.get("retypeNewPassword"),
      logoutOtherDevices,
    };
    console.log(data);
    handleClose();
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Change Password
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
        }}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Your password must be at least 6 characters and should include a
            combination of numbers, letters, and special characters (!@$%^&*).
          </Typography>
          <TextField
            required
            fullWidth
            margin="dense"
            id="currentPassword"
            name="currentPassword"
            label="Current password"
            type="password"
            variant="outlined"
            helperText="Updated 04/20/2024"
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
          <Link href="#" variant="body2" sx={{ display: "block", mt: 1, mb: 2 }}>
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
