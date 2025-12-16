import mongoose, { Schema, Document } from 'mongoose';

export interface IMultiTenantUser extends Document {
  _id: string;
  tenantId: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'tenant_admin' | 'admin' | 'pharmacist' | 'user';
  permissions: string[];
  profile: {
    avatar?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    licenseNumber?: string;
    specialization?: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      lowStock: boolean;
      expiry: boolean;
      prescriptions: boolean;
    };
  };
  security: {
    lastLogin?: Date;
    lastPasswordChange?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    recoveryTokens: string[];
  };
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MultiTenantUserSchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
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
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'admin', 'pharmacist', 'user'],
    default: 'user'
  },
  permissions: [{
    type: String
  }],
  profile: {
    avatar: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    licenseNumber: String,
    specialization: String
  },
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
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      lowStock: {
        type: Boolean,
        default: true
      },
      expiry: {
        type: Boolean,
        default: true
      },
      prescriptions: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    lastLogin: Date,
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    recoveryTokens: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Compound indexes for multi-tenant queries
MultiTenantUserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
MultiTenantUserSchema.index({ tenantId: 1, username: 1 }, { unique: true });
MultiTenantUserSchema.index({ tenantId: 1, role: 1 });
MultiTenantUserSchema.index({ tenantId: 1, isActive: 1 });
MultiTenantUserSchema.index({ email: 1 });

// Virtual for full name
MultiTenantUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if account is locked
MultiTenantUserSchema.methods.isLocked = function() {
  return !!(this.security.lockedUntil && this.security.lockedUntil > Date.now());
};

export default mongoose.models.MultiTenantUser || mongoose.model<IMultiTenantUser>('MultiTenantUser', MultiTenantUserSchema);