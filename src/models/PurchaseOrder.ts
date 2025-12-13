import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrder extends Document {
  tenantId: string;
  poNumber: string;
  supplierId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    expectedPrice: number;
    receivedQuantity: number;
  }>;
  status: 'draft' | 'submitted' | 'received' | 'cancelled';
  totalAmount: number;
  expectedArrival?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        expectedPrice: { type: Number, required: true },
        receivedQuantity: { type: Number, default: 0 },
      },
    ],
    status: { 
      type: String, 
      enum: ['draft', 'submitted', 'received', 'cancelled'], 
      default: 'draft' 
    },
    totalAmount: { type: Number, required: true },
    expectedArrival: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ tenantId: 1, poNumber: 1 });
PurchaseOrderSchema.index({ tenantId: 1, status: 1 });

export default mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);