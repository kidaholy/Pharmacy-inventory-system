import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  tenantId: string;
  prescriptionNo: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorName?: string;
  doctorLicense?: string;
  prescribedDrugs: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
  }>;
  prescriptionImage?: string;
  status: 'pending' | 'processed' | 'rejected';
  saleId?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema(
  {
    tenantId: { type: String, required: true, index: true },
    prescriptionNo: { type: String, required: true, unique: true },
    patientName: { type: String, required: true },
    patientAge: { type: Number },
    patientGender: { type: String },
    doctorName: { type: String },
    doctorLicense: { type: String },
    prescribedDrugs: [
      {
        drugName: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    prescriptionImage: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'processed', 'rejected'], 
      default: 'pending' 
    },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PrescriptionSchema.index({ tenantId: 1, prescriptionNo: 1 });
PrescriptionSchema.index({ tenantId: 1, status: 1 });

export default mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);