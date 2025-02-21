import { IUser } from '@/domain/User';
import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lineToken: {
      accessTokenIv: {type: String},
      accessToken: { type: String, unique: true },
      secretTokenIv: {type: String},
      secretToken: { type: String, unique: true },
      userIdIv: { type: String, unique: true },
      userId: { type: String, unique: true },
    },
    messengerToken: {
      accessTokenIv: {type: String},
      accessToken: { type: String, unique: true },
      userIdIv: { type: String},
      userId: { type: String, unique: true },
    }
  },
  { timestamps: true, collection: 'users' }
);

const User = mongoose.models.User || mongoose.model('User', userSchema); // if User not create, will create/ if craete, will pass to User
export default User;
