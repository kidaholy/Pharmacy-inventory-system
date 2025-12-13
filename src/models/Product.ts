import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  tenantId: string;
  name: string;
  brand?: string;
  category: string;
  dosage?: string;
  unit: string;
  barcode?: string;
  sku: string;
  minReorderLevel: number;
  isControlledSubstance: boolean;
  retailPrice: number;
  image?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, required: true },
    dosage: { type: String },
    unit: { type: String, required: true },
    barcode: { type: String },
    sku: { type: String, required: true, unique: true },
    minReorderLevel: { type: Number, default: 10 },
    isControlledSubstance: { type: Boolean, default: false },
    retailPrice: { type: Number, required: true },
    image: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ tenantId: 1, name: 1 });
ProductSchema.index({ tenantId: 1, barcode: 1 });
ProductSchema.index({ tenantId: 1, sku: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);