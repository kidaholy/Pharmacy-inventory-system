const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// Define schemas
const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  subdomain: { type: String, required: true, unique: true, lowercase: true, match: /^[a-z0-9-]+$/ },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subscriptionPlan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
  subscriptionStatus: { type: String, enum: ['active', 'inactive', 'suspended', 'cancelled'], default: 'active' },
  subscriptionStartDate: { type: Date, default: Date.now },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    features: [String],
    limits: {
      users: { type: Number, default: 5 },
      medicines: { type: Number, default: 1000 },
      prescriptions: { type: Number, default: 10000 },
      storage: { type: Number, default: 100 }
    }
  },
  contact: {
    email: { type: String, required: true, lowercase: true },
    phone: String,
    city: String,
    country: String
  },
  billing: {
    companyName: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const MedicineSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true, maxlength: 200 },
  genericName: String,
  manufacturer: String,
  category: String,
  dosage: {
    strength: String,
    form: String
  },
  stock: {
    current: { type: Number, required: true, min: 0 },
    minimum: { type: Number, required: true, min: 0 },
    maximum: { type: Number, min: 0 }
  },
  pricing: {
    costPrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    margin: Number
  },
  dates: {
    manufactureDate: Date,
    expiryDate: Date,
    lastUpdated: { type: Date, default: Date.now }
  },
  supplier: {
    name: String,
    contact: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas with Mongoose...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📦 Using database: pharmacy');
    
    // Create models (this will create collections)
    const Tenant = mongoose.model('Tenant', TenantSchema);
    const Medicine = mongoose.model('Medicine', MedicineSchema);
    
    console.log('🏗️  Collections will be created when first document is inserted...');
    
    // Insert sample tenant
    console.log('📝 Creating sample tenant...');
    const sampleTenant = new Tenant({
      name: 'Demo Pharmacy',
      subdomain: 'demo-pharmacy',
      ownerId: new mongoose.Types.ObjectId(),
      subscriptionPlan: 'starter',
      subscriptionStatus: 'active',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        features: ['inventory', 'prescriptions'],
        limits: {
          users: 5,
          medicines: 1000,
          prescriptions: 10000,
          storage: 100
        }
      },
      contact: {
        email: 'demo@demopharmacy.com',
        phone: '+1234567890',
        city: 'Demo City',
        country: 'Demo Country'
      },
      billing: {
        companyName: 'Demo Pharmacy Inc.'
      }
    });
    
    const savedTenant = await sampleTenant.save();
    console.log('✅ Created sample tenant:', savedTenant._id);
    
    // Insert sample medicine
    console.log('📝 Creating sample medicine...');
    const sampleMedicine = new Medicine({
      tenantId: savedTenant._id,
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      manufacturer: 'Demo Pharma Co.',
      category: 'Tablet',
      dosage: {
        strength: '500mg',
        form: 'Tablet'
      },
      stock: {
        current: 100,
        minimum: 10,
        maximum: 500
      },
      pricing: {
        costPrice: 2.50,
        sellingPrice: 4.00,
        margin: 60
      },
      dates: {
        manufactureDate: new Date('2024-01-01'),
        expiryDate: new Date('2026-01-01')
      },
      supplier: {
        name: 'Demo Supplier',
        contact: 'supplier@demo.com'
      }
    });
    
    const savedMedicine = await sampleMedicine.save();
    console.log('✅ Created sample medicine:', savedMedicine._id);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Created collections:', collections.map(c => c.name));
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Database: pharmacy');
    console.log('📝 Sample data inserted');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.log('💡 This might be a network/firewall issue. Try:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify MongoDB Atlas IP whitelist settings');
      console.log('   3. Check if your firewall is blocking the connection');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

setupDatabase();