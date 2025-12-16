import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  _id: string;
  name: string;
  subdomain: string;
  domain?: string;
  ownerId: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'cancelled';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  settings: {
    timezone: string;
    currency: string;
    language: string;
    features: string[];
    limits: {
      users: number;
      medicines: number;
      prescriptions: number;
      storage: number; // in MB
    };
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  billing: {
    companyName?: string;
    taxId?: string;
    billingEmail?: string;
    paymentMethod?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subdomain: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 50
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: 'starter'
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'cancelled'],
    default: 'active'
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now
  },
  subscriptionEndDate: {
    type: Date
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'en'
    },
    features: [{
      type: String
    }],
    limits: {
      users: {
        type: Number,
        default: 5
      },
      medicines: {
        type: Number,
        default: 1000
      },
      prescriptions: {
        type: Number,
        default: 10000
      },
      storage: {
        type: Number,
        default: 100 // MB
      }
    }
  },
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  billing: {
    companyName: String,
    taxId: String,
    billingEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    paymentMethod: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
TenantSchema.index({ subdomain: 1 });
TenantSchema.index({ domain: 1 });
TenantSchema.index({ ownerId: 1 });
TenantSchema.index({ subscriptionStatus: 1 });
TenantSchema.index({ isActive: 1 });

// Virtual for full domain
TenantSchema.virtual('fullDomain').get(function() {
  return this.domain || `${this.subdomain}.pharmatrack.com`;
});

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);