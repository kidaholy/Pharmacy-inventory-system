import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
  tenantId: string;
  invoiceNo: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    batchId: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile';
  customerId?: mongoose.Types.ObjectId;
  prescriptionId?: mongoose.Types.ObjectId;
  cashierId: mongoose.Types.ObjectId;
  saleDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    invoiceNo: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'mobile'], required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    prescriptionId: { type: Schema.Types.ObjectId, ref: 'Prescription' },
    cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    saleDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

SaleSchema.index({ tenantId: 1, saleDate: -1 });
SaleSchema.index({ tenantId: 1, invoiceNo: 1 });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);