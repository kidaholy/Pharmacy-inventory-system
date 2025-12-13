import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  tenantId: string;
  productId: mongoose.Types.ObjectId;
  batchNo: string;
  quantity: number;
  remainingQuantity: number;
  expiryDate: Date;
  purchasePrice: number;
  retailPrice: number;
  supplierId: mongoose.Types.ObjectId;
  receivedDate: Date;
  invoiceNo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batchNo: { type: String, required: true },
    quantity: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    retailPrice: { type: Number, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    receivedDate: { type: Date, default: Date.now },
    invoiceNo: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BatchSchema.index({ tenantId: 1, productId: 1 });
BatchSchema.index({ tenantId: 1, expiryDate: 1 });
BatchSchema.index({ tenantId: 1, batchNo: 1 });

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);