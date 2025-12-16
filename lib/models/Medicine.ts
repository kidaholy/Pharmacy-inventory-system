import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  _id: string;
  tenantId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  category: string;
  subcategory?: string;
  description?: string;
  dosage: string;
  strength?: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'other';
  manufacturer: string;
  supplier: string;
  batchNumber: string;
  barcode?: string;
  sku?: string;
  stock: {
    current: number;
    minimum: number;
    maximum?: number;
    reserved?: number;
    available: number;
  };
  pricing: {
    costPrice: number;
    sellingPrice: number;
    mrp: number;
    discount?: number;
    tax?: number;
  };
  dates: {
    manufactureDate?: Date;
    expiryDate: Date;
    receivedDate?: Date;
    lastUpdated: Date;
  };
  storage: {
    location?: string;
    rackNumber?: string;
    temperature?: string;
    humidity?: string;
    specialInstructions?: string;
  };
  regulatory: {
    drugLicenseNumber?: string;
    scheduleType?: string;
    prescriptionRequired: boolean;
    controlledSubstance: boolean;
  };
  composition?: [{
    ingredient: string;
    quantity: string;
    unit: string;
  }];
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  warnings?: string[];
  images?: string[];
  documents?: [{
    name: string;
    url: string;
    type: string;
  }];
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema: Schema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  genericName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  brandName: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  strength: {
    type: String,
    trim: true,
    maxlength: 50
  },
  form: {
    type: String,
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'],
    required: true
  },
  manufacturer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  supplier: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  barcode: {
    type: String,
    trim: true,
    maxlength: 50
  },
  sku: {
    type: String,
    trim: true,
    maxlength: 50
  },
  stock: {
    current: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    minimum: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    maximum: {
      type: Number,
      min: 0
    },
    reserved: {
      type: Number,
      min: 0,
      default: 0
    },
    available: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tax: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  dates: {
    manufactureDate: Date,
    expiryDate: {
      type: Date,
      required: true
    },
    receivedDate: Date,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  storage: {
    location: String,
    rackNumber: String,
    temperature: String,
    humidity: String,
    specialInstructions: String
  },
  regulatory: {
    drugLicenseNumber: String,
    scheduleType: String,
    prescriptionRequired: {
      type: Boolean,
      default: false
    },
    controlledSubstance: {
      type: Boolean,
      default: false
    }
  },
  composition: [{
    ingredient: {
      type: String,
      required: true
    },
    quantity: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  }],
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  warnings: [String],
  images: [String],
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
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
MedicineSchema.index({ tenantId: 1, name: 1 });
MedicineSchema.index({ tenantId: 1, category: 1 });
MedicineSchema.index({ tenantId: 1, manufacturer: 1 });
MedicineSchema.index({ tenantId: 1, supplier: 1 });
MedicineSchema.index({ tenantId: 1, batchNumber: 1 });
MedicineSchema.index({ tenantId: 1, 'dates.expiryDate': 1 });
MedicineSchema.index({ tenantId: 1, 'stock.current': 1 });
MedicineSchema.index({ tenantId: 1, isActive: 1 });
MedicineSchema.index({ tenantId: 1, barcode: 1 });
MedicineSchema.index({ tenantId: 1, sku: 1 });

// Text search index
MedicineSchema.index({ 
  tenantId: 1,
  name: 'text', 
  genericName: 'text', 
  brandName: 'text', 
  description: 'text',
  manufacturer: 'text',
  supplier: 'text'
});

// Pre-save middleware to calculate available stock
MedicineSchema.pre('save', function(next) {
  this.stock.available = this.stock.current - (this.stock.reserved || 0);
  this.dates.lastUpdated = new Date();
  next();
});

// Virtual for stock status
MedicineSchema.virtual('stockStatus').get(function() {
  if (this.stock.current <= 0) return 'out_of_stock';
  if (this.stock.current <= this.stock.minimum) return 'low_stock';
  if (this.stock.maximum && this.stock.current >= this.stock.maximum) return 'overstock';
  return 'in_stock';
});

// Virtual for expiry status
MedicineSchema.virtual('expiryStatus').get(function() {
  const now = new Date();
  const expiryDate = new Date(this.dates.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry <= 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  if (daysUntilExpiry <= 90) return 'expiring_warning';
  return 'valid';
});

export default mongoose.models.Medicine || mongoose.model<IMedicine>('Medicine', MedicineSchema);