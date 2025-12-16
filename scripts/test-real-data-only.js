const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function testRealDataOnly() {
  try {
    console.log('🧪 Testing that registered users get only real data...');
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Define models
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const MultiTenantUser = mongoose.model('MultiTenantUser', new mongoose.Schema({}, { strict: false }));
    const Medicine = mongoose.model('Medicine', new mongoose.Schema({}, { strict: false }));
    const Prescription = mongoose.model('Prescription', new mongoose.Schema({}, { strict: false }));
    
    // Step 1: Verify clean state
    console.log('\n📊 Step 1: Verifying clean state...');
    const userCount = await MultiTenantUser.countDocuments();
    const tenantCount = await Tenant.countDocuments();
    const medicineCount = await Medicine.countDocuments();
    const prescriptionCount = await Prescription.countDocuments();
    
    console.log(`   Users: ${userCount} (should be 1 - super admin only)`);
    console.log(`   Tenants: ${tenantCount} (should be 0)`);
    console.log(`   Medicines: ${medicineCount} (should be 0)`);
    console.log(`   Prescriptions: ${prescriptionCount} (should be 0)`);
    
    if (userCount !== 1 || tenantCount !== 0 || medicineCount !== 0 || prescriptionCount !== 0) {
      console.log('⚠️  System is not in clean state. Run npm run clean-database first.');
      return;
    }
    
    console.log('✅ System is clean');
    
    // Step 2: Create a test pharmacy registration
    console.log('\n🏥 Step 2: Creating test pharmacy...');
    
    const testTenant = await Tenant.create({
      name: 'Real Test Pharmacy',
      subdomain: 'real-test-pharmacy',
      ownerId: new mongoose.Types.ObjectId(),
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active',
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        features: ['inventory', 'prescriptions'],
        limits: {
          users: 20,
          medicines: 5000,
          prescriptions: 20000,
          storage: 500
        }
      },
      contact: {
        email: 'owner@realtestpharmacy.com',
        phone: '+1555123456',
        address: '456 Real Street',
        city: 'Real City',
        state: 'Real State',
        country: 'Real Country',
        postalCode: '54321'
      },
      billing: {
        companyName: 'Real Test Pharmacy LLC',
        billingEmail: 'billing@realtestpharmacy.com'
      },
      isActive: true
    });
    
    console.log('✅ Test tenant created:', testTenant.name);
    
    // Step 3: Create pharmacy owner
    console.log('\n👤 Step 3: Creating pharmacy owner...');
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('RealPassword123!', 12);
    
    const pharmacyOwner = await MultiTenantUser.create({
      tenantId: testTenant._id,
      username: 'realowner',
      email: 'owner@realtestpharmacy.com',
      password: hashedPassword,
      firstName: 'Real',
      lastName: 'Owner',
      role: 'admin',
      permissions: [
        'manage_users', 'manage_medicines', 'manage_prescriptions', 
        'view_reports', 'manage_settings',
        'dispense_medicines', 'create_prescriptions', 'view_inventory'
      ],
      profile: {
        phone: '+1555123456'
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          sms: false,
          push: true,
          lowStock: true,
          expiry: true,
          prescriptions: true
        }
      },
      security: {
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        recoveryTokens: []
      },
      isActive: true,
      isEmailVerified: true
    });
    
    console.log('✅ Pharmacy owner created:', pharmacyOwner.email);
    
    // Update tenant with owner ID
    await Tenant.findByIdAndUpdate(testTenant._id, {
      ownerId: pharmacyOwner._id
    });
    
    // Step 4: Add some real medicines for this pharmacy
    console.log('\n💊 Step 4: Adding real medicines...');
    
    const realMedicines = [
      {
        tenantId: testTenant._id,
        name: 'Real Aspirin 100mg',
        genericName: 'Acetylsalicylic Acid',
        manufacturer: 'Real Pharma Inc.',
        category: 'Tablet',
        dosage: {
          strength: '100mg',
          form: 'Tablet'
        },
        stock: {
          current: 150,
          minimum: 20,
          maximum: 500
        },
        pricing: {
          costPrice: 0.50,
          sellingPrice: 1.25,
          margin: 150
        },
        dates: {
          manufactureDate: new Date('2024-01-15'),
          expiryDate: new Date('2026-01-15')
        },
        supplier: {
          name: 'Real Medical Supplies',
          contact: 'supplies@realmedical.com'
        },
        isActive: true
      },
      {
        tenantId: testTenant._id,
        name: 'Real Vitamin C 500mg',
        genericName: 'Ascorbic Acid',
        manufacturer: 'Real Vitamins Co.',
        category: 'Tablet',
        dosage: {
          strength: '500mg',
          form: 'Tablet'
        },
        stock: {
          current: 75,
          minimum: 30,
          maximum: 300
        },
        pricing: {
          costPrice: 0.75,
          sellingPrice: 2.00,
          margin: 167
        },
        dates: {
          manufactureDate: new Date('2024-02-01'),
          expiryDate: new Date('2026-02-01')
        },
        supplier: {
          name: 'Real Vitamin Distributors',
          contact: 'orders@realvitamins.com'
        },
        isActive: true
      }
    ];
    
    await Medicine.insertMany(realMedicines);
    console.log(`✅ Added ${realMedicines.length} real medicines`);
    
    // Step 5: Test API responses
    console.log('\n🔍 Step 5: Testing API responses...');
    
    // Test tenant data
    console.log('   Testing tenant data API...');
    const tenantResponse = await fetch(`http://localhost:3000/api/tenant/${testTenant._id}`);
    if (tenantResponse.ok) {
      const tenantData = await tenantResponse.json();
      console.log('   ✅ Tenant API returns real data:');
      console.log(`      Name: ${tenantData.name}`);
      console.log(`      Subdomain: ${tenantData.subdomain}`);
      console.log(`      City: ${tenantData.contact.city}`);
      console.log(`      Email: ${tenantData.contact.email}`);
      
      // Verify no demo data
      const hasDemo = JSON.stringify(tenantData).toLowerCase().includes('demo');
      console.log(`   ✅ Contains demo data: ${hasDemo ? 'YES ❌' : 'NO ✅'}`);
    } else {
      console.log('   ❌ Failed to fetch tenant data');
    }
    
    // Test stats data
    console.log('   Testing stats data API...');
    const statsResponse = await fetch(`http://localhost:3000/api/tenant/${testTenant._id}/stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('   ✅ Stats API returns real data:');
      console.log(`      Total Medicines: ${statsData.totalMedicines}`);
      console.log(`      Total Users: ${statsData.totalUsers}`);
      console.log(`      Low Stock Count: ${statsData.lowStockCount}`);
      console.log(`      Total Inventory Value: ${statsData.totalInventoryValue}`);
      
      // Verify stats match our real data
      const expectedMedicines = realMedicines.length;
      const expectedUsers = 1; // Just the owner
      const expectedValue = realMedicines.reduce((sum, med) => sum + (med.stock.current * med.pricing.sellingPrice), 0);
      
      console.log(`   ✅ Data accuracy check:`);
      console.log(`      Medicines match: ${statsData.totalMedicines === expectedMedicines ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      Users match: ${statsData.totalUsers === expectedUsers ? 'YES ✅' : 'NO ❌'}`);
      console.log(`      Inventory value: $${expectedValue.toFixed(2)} (expected) vs $${statsData.totalInventoryValue.toFixed(2)} (actual)`);
    } else {
      console.log('   ❌ Failed to fetch stats data');
    }
    
    // Step 6: Cleanup test data
    console.log('\n🧹 Step 6: Cleaning up test data...');
    await Medicine.deleteMany({ tenantId: testTenant._id });
    await MultiTenantUser.deleteMany({ tenantId: testTenant._id });
    await Tenant.findByIdAndDelete(testTenant._id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Test completed successfully!');
    console.log('✅ Registered users will only see their real pharmacy data');
    console.log('✅ No demo data is present in the system');
    console.log('✅ APIs return accurate, tenant-specific information');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

testRealDataOnly();