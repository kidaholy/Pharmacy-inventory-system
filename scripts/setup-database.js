const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('pharmacy');
    console.log('📦 Using database: pharmacy');
    
    // Create collections with validation schemas
    console.log('🏗️  Creating collections...');
    
    // 1. Create Tenants collection
    try {
      await db.createCollection('tenants', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'subdomain', 'ownerId', 'contact'],
            properties: {
              name: { bsonType: 'string', maxLength: 100 },
              subdomain: { bsonType: 'string', pattern: '^[a-z0-9-]+$', maxLength: 50 },
              ownerId: { bsonType: 'objectId' },
              subscriptionPlan: { enum: ['starter', 'professional', 'enterprise'] },
              subscriptionStatus: { enum: ['active', 'inactive', 'suspended', 'cancelled'] },
              contact: {
                bsonType: 'object',
                required: ['email'],
                properties: {
                  email: { bsonType: 'string' }
                }
              },
              isActive: { bsonType: 'bool' }
            }
          }
        }
      });
      console.log('✅ Created tenants collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️  Tenants collection already exists');
      } else {
        throw error;
      }
    }
    
    // 2. Create MultiTenantUsers collection
    try {
      await db.createCollection('multitenantusers', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['tenantId', 'email', 'password', 'role'],
            properties: {
              tenantId: { bsonType: 'objectId' },
              email: { bsonType: 'string' },
              password: { bsonType: 'string' },
              role: { enum: ['admin', 'pharmacist', 'cashier', 'viewer'] },
              isActive: { bsonType: 'bool' }
            }
          }
        }
      });
      console.log('✅ Created multitenantusers collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️  MultiTenantUsers collection already exists');
      } else {
        throw error;
      }
    }
    
    // 3. Create Medicines collection
    try {
      await db.createCollection('medicines', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['tenantId', 'name', 'stock', 'pricing'],
            properties: {
              tenantId: { bsonType: 'objectId' },
              name: { bsonType: 'string', maxLength: 200 },
              genericName: { bsonType: 'string' },
              manufacturer: { bsonType: 'string' },
              category: { bsonType: 'string' },
              stock: {
                bsonType: 'object',
                required: ['current', 'minimum'],
                properties: {
                  current: { bsonType: 'number', minimum: 0 },
                  minimum: { bsonType: 'number', minimum: 0 },
                  maximum: { bsonType: 'number', minimum: 0 }
                }
              },
              pricing: {
                bsonType: 'object',
                required: ['sellingPrice'],
                properties: {
                  costPrice: { bsonType: 'number', minimum: 0 },
                  sellingPrice: { bsonType: 'number', minimum: 0 }
                }
              },
              isActive: { bsonType: 'bool' }
            }
          }
        }
      });
      console.log('✅ Created medicines collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️  Medicines collection already exists');
      } else {
        throw error;
      }
    }
    
    // 4. Create Prescriptions collection
    try {
      await db.createCollection('prescriptions', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['tenantId', 'prescriptionNumber', 'patient', 'medicines'],
            properties: {
              tenantId: { bsonType: 'objectId' },
              prescriptionNumber: { bsonType: 'string' },
              patient: {
                bsonType: 'object',
                required: ['name'],
                properties: {
                  name: { bsonType: 'string' }
                }
              },
              medicines: {
                bsonType: 'array',
                items: {
                  bsonType: 'object',
                  required: ['medicineId', 'quantity'],
                  properties: {
                    medicineId: { bsonType: 'objectId' },
                    quantity: { bsonType: 'number', minimum: 1 }
                  }
                }
              },
              status: { enum: ['pending', 'dispensed', 'cancelled'] },
              isActive: { bsonType: 'bool' }
            }
          }
        }
      });
      console.log('✅ Created prescriptions collection');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('ℹ️  Prescriptions collection already exists');
      } else {
        throw error;
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    
    // Tenants indexes
    await db.collection('tenants').createIndex({ subdomain: 1 }, { unique: true });
    await db.collection('tenants').createIndex({ ownerId: 1 });
    await db.collection('tenants').createIndex({ isActive: 1 });
    
    // MultiTenantUsers indexes
    await db.collection('multitenantusers').createIndex({ tenantId: 1, email: 1 }, { unique: true });
    await db.collection('multitenantusers').createIndex({ tenantId: 1 });
    await db.collection('multitenantusers').createIndex({ isActive: 1 });
    
    // Medicines indexes
    await db.collection('medicines').createIndex({ tenantId: 1 });
    await db.collection('medicines').createIndex({ tenantId: 1, name: 1 });
    await db.collection('medicines').createIndex({ tenantId: 1, isActive: 1 });
    await db.collection('medicines').createIndex({ tenantId: 1, 'stock.current': 1 });
    
    // Prescriptions indexes
    await db.collection('prescriptions').createIndex({ tenantId: 1 });
    await db.collection('prescriptions').createIndex({ tenantId: 1, prescriptionNumber: 1 }, { unique: true });
    await db.collection('prescriptions').createIndex({ tenantId: 1, status: 1 });
    await db.collection('prescriptions').createIndex({ tenantId: 1, isActive: 1 });
    
    console.log('✅ Created all indexes');
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    // Sample tenant
    const sampleTenant = {
      name: 'Demo Pharmacy',
      subdomain: 'demo-pharmacy',
      ownerId: new client.db().admin().command({ ismaster: 1 }).then(() => new require('mongodb').ObjectId()),
      subscriptionPlan: 'starter',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
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
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const tenantResult = await db.collection('tenants').insertOne(sampleTenant);
    console.log('✅ Inserted sample tenant:', tenantResult.insertedId);
    
    // Sample medicine
    const sampleMedicine = {
      tenantId: tenantResult.insertedId,
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
        expiryDate: new Date('2026-01-01'),
        lastUpdated: new Date()
      },
      supplier: {
        name: 'Demo Supplier',
        contact: 'supplier@demo.com'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const medicineResult = await db.collection('medicines').insertOne(sampleMedicine);
    console.log('✅ Inserted sample medicine:', medicineResult.insertedId);
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Database: pharmacy');
    console.log('📋 Collections created: tenants, multitenantusers, medicines, prescriptions');
    console.log('🔍 Indexes created for optimal performance');
    console.log('📝 Sample data inserted');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

setupDatabase();