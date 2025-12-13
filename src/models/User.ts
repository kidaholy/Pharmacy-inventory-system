import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  tenantId: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'cashier' | 'pharmacist';
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'cashier', 'pharmacist'], 
      default: 'cashier' 
    },
    isActive: { type: Boolean, default: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.index({ tenantId: 1, email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);