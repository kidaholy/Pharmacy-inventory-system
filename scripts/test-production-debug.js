async function testProductionDebug() {
  try {
    console.log('🌐 Testing production debug endpoint...');
    
    const response = await fetch('https://pharmacy-inventory-system-gilt.vercel.app/api/debug/database');
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📊 Production Database Status:');
      console.log('Environment:', data.environment);
      console.log('Database:', data.database);
      
      if (data.database.tenantsCount === 0) {
        console.log('\n❌ ISSUE FOUND: No tenants in production database!');
        console.log('   This explains why login fails.');
        console.log('   Solution: Set MONGODB_URI environment variable in Vercel');
      } else {
        console.log('\n✅ Database looks good!');
        console.log(`   Tenants: ${data.database.tenantsCount}`);
        console.log(`   Users: ${data.database.usersCount}`);
      }
    } else {
      console.log('❌ Debug endpoint not ready yet or failed');
      const text = await response.text();
      console.log('Response:', text);
    }
    
  } catch (error) {
    console.log('❌ Error testing debug endpoint:', error.message);
    console.log('   The deployment might still be in progress...');
  }
}

testProductionDebug();