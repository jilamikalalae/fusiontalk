import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lineToken: {
      accessToken: { type: String, unique: true },
      secretToken: { type: String, unique: true }
    }
  },
  { timestamps: true },
  { collection: 'users', db: 'fusionTalk' }
);

const User = mongoose.models.User || mongoose.model('User', userSchema); // if User not create, will create/ if craete, will pass to User
export default User;
