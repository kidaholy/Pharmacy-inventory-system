import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  tenantId: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ tenantId: 1, name: 1 });

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);