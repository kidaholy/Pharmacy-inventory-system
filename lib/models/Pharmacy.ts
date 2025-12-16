import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacy extends Document {
  _id: string;
  tenantId: string;
  name: string;
  licenseNumber: string;
  ownerId: string;
  contact: {
    email: string;
    phone: string;
    fax?: string;
    website?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  services: string[];
  certifications: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacySchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  licenseNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    fax: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  operatingHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '17:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '16:00' },
      closed: { type: Boolean, default: true }
    }
  },
  services: [{
    type: String,
    enum: [
      'prescription_dispensing',
      'otc_medications',
      'health_consultations',
      'vaccination_services',
      'medication_therapy_management',
      'compounding',
      'home_delivery',
      'health_screenings',
      'medical_equipment',
      'insurance_billing'
    ]
  }],
  certifications: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for multi-tenant queries
PharmacySchema.index({ tenantId: 1 });
PharmacySchema.index({ tenantId: 1, ownerId: 1 });
PharmacySchema.index({ tenantId: 1, isActive: 1 });
PharmacySchema.index({ licenseNumber: 1 }, { unique: true });
PharmacySchema.index({ 'contact.email': 1 });
PharmacySchema.index({ 'address.city': 1, 'address.state': 1 });

export default mongoose.models.Pharmacy || mongoose.model<IPharmacy>('Pharmacy', PharmacySchema);