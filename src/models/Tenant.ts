import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  subdomain: string;
  logo?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  licenseType: 'trial' | 'subscription' | 'lifetime';
  licenseExpiry?: Date;
  isActive: boolean;
  settings: {
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subdomain: { type: String, required: true, unique: true },
    logo: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    address: { type: String },
    licenseType: { 
      type: String, 
      enum: ['trial', 'subscription', 'lifetime'], 
      default: 'trial' 
    },
    licenseExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    settings: {
      currency: { type: String, default: 'USD' },
      taxRate: { type: Number, default: 0 },
      invoicePrefix: { type: String, default: 'INV' },
      timezone: { type: String, default: 'UTC' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);