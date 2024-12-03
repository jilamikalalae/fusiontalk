import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure unique emails
    password: { type: String, required: true },
  }, 
  { timestamps: true },
  { collection: 'users', db: 'fusionTalk' }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
