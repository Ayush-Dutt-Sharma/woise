import mongoose, { Schema, models } from 'mongoose';

const userTokenSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    lastUsed:{
        type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const UserToken = models.UserToken || mongoose.model('UserToken', userTokenSchema);
export default UserToken;