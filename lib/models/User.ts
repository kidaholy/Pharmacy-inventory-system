import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  tenantId?: string; // null for super_admin, required for others
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'tenant_admin' | 'admin' | 'pharmacist' | 'user';
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    department?: string;
    position?: string;
  };
  permissions: string[];
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: function(this: IUser) {
      return this.role !== 'super_admin';
    }
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'admin', 'pharmacist', 'user'],
    default: 'user'
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: String,
    department: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  permissions: [{
    type: String
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound unique index for tenant-scoped usernames and emails
UserSchema.index({ tenantId: 1, username: 1 }, { unique: true });
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
UserSchema.index({ email: 1 }); // Global email index for super_admin
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);