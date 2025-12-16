import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescription extends Document {
  _id: string;
  tenantId: string;
  prescriptionNumber: string;
  patient: {
    id?: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string[];
    medicalHistory?: string[];
  };
  doctor: {
    id?: string;
    name: string;
    licenseNumber?: string;
    specialization?: string;
    phone?: string;
    email?: string;
    hospital?: string;
  };
  medicines: [{
    medicineId: string;
    medicineName: string;
    dosage: string;
    quantity: number;
    instructions: string;
    frequency: string;
    duration: string;
    price: number;
    totalPrice: number;
    substitutionAllowed: boolean;
  }];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  status: 'pending' | 'partial' | 'dispensed' | 'cancelled' | 'returned';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  type: 'regular' | 'emergency' | 'chronic' | 'insurance';
  payment: {
    method?: 'cash' | 'card' | 'insurance' | 'credit';
    status: 'pending' | 'paid' | 'partial' | 'refunded';
    paidAmount?: number;
    insuranceDetails?: {
      provider: string;
      policyNumber: string;
      claimNumber?: string;
      coveragePercentage: number;
    };
  };
  dates: {
    prescribed: Date;
    received: Date;
    dispensed?: Date;
    dueDate?: Date;
  };
  notes?: string;
  internalNotes?: string;
  attachments?: [{
    name: string;
    url: string;
    type: string;
  }];
  dispensedBy?: string;
  verifiedBy?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  prescriptionNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  patient: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Patient'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    address: String,
    allergies: [String],
    medicalHistory: [String]
  },
  doctor: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    licenseNumber: String,
    specialization: String,
    phone: String,
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    hospital: String
  },
  medicines: [{
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    medicineName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    instructions: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    substitutionAllowed: {
      type: Boolean,
      default: false
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'dispensed', 'cancelled', 'returned'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  type: {
    type: String,
    enum: ['regular', 'emergency', 'chronic', 'insurance'],
    default: 'regular'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'insurance', 'credit']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      min: 0
    },
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      claimNumber: String,
      coveragePercentage: {
        type: Number,
        min: 0,
        max: 100
      }
    }
  },
  dates: {
    prescribed: {
      type: Date,
      required: true
    },
    received: {
      type: Date,
      required: true,
      default: Date.now
    },
    dispensed: Date,
    dueDate: Date
  },
  notes: String,
  internalNotes: String,
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  dispensedBy: {
    type: Schema.Types.ObjectId,
    ref: 'MultiTenantUser'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'MultiTenantUser'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'MultiTenantUser',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'MultiTenantUser',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for multi-tenant queries
PrescriptionSchema.index({ tenantId: 1, prescriptionNumber: 1 }, { unique: true });
PrescriptionSchema.index({ tenantId: 1, status: 1 });
PrescriptionSchema.index({ tenantId: 1, priority: 1 });
PrescriptionSchema.index({ tenantId: 1, 'patient.name': 1 });
PrescriptionSchema.index({ tenantId: 1, 'doctor.name': 1 });
PrescriptionSchema.index({ tenantId: 1, 'dates.received': 1 });
PrescriptionSchema.index({ tenantId: 1, 'dates.dispensed': 1 });
PrescriptionSchema.index({ tenantId: 1, isActive: 1 });

// Text search index
PrescriptionSchema.index({ 
  tenantId: 1,
  prescriptionNumber: 'text',
  'patient.name': 'text',
  'doctor.name': 'text',
  notes: 'text'
});

// Pre-save middleware to calculate totals
PrescriptionSchema.pre('save', function(next) {
  this.totals.subtotal = this.medicines.reduce((sum, med) => sum + med.totalPrice, 0);
  this.totals.total = this.totals.subtotal - this.totals.discount + this.totals.tax;
  next();
});

export default mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);