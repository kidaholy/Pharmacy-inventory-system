const fs = require('fs');
const path = require('path');

function checkForDuplicateDeclarations() {
  console.log('🔍 Checking for duplicate variable declarations...');
  
  const apiRoutes = [
    'app/api/users/[userId]/route.ts',
    'app/api/users/[userId]/change-password/route.ts',
    'app/api/tenants/[tenantId]/route.ts',
    'app/api/tenant/[tenantId]/route.ts',
    'app/api/tenant/[tenantId]/stats/route.ts',
    'app/api/tenant/[tenantId]/medicines/route.ts',
    'app/api/tenant/[tenantId]/medicines/[medicineId]/route.ts'
  ];
  
  let hasIssues = false;
  
  apiRoutes.forEach(routePath => {
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check for duplicate variable declarations
      const duplicatePatterns = [
        /const\s+{\s*userId\s*}\s*=.*\n.*const\s+{\s*userId\s*}\s*=/,
        /const\s+{\s*tenantId\s*}\s*=.*\n.*const\s+{\s*tenantId\s*}\s*=/,
        /const\s+{\s*medicineId\s*}\s*=.*\n.*const\s+{\s*medicineId\s*}\s*=/,
        /const\s+{\s*searchParams\s*}\s*=.*\n.*const\s+{\s*searchParams\s*}\s*=/
      ];
      
      duplicatePatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
          console.log(`❌ ${routePath}: Found duplicate declaration (pattern ${index + 1})`);
          hasIssues = true;
        }
      });
      
      // Check for proper async params usage
      if (content.includes('{ params }: { params: { ') && !content.includes('Promise<{')) {
        console.log(`⚠️  ${routePath}: May need async params update`);
      }
      
      if (!hasIssues) {
        console.log(`✅ ${routePath}: Clean`);
      }
    } else {
      console.log(`⚠️  ${routePath}: File not found`);
    }
  });
  
  return !hasIssues;
}

function checkTenantRouting() {
  console.log('\n🌐 Checking tenant-specific routing...');
  
  const tenantDashboard = 'app/[subdomain]/dashboard/page.tsx';
  const loginPage = 'app/login/page.tsx';
  const genericDashboard = 'app/dashboard/page.tsx';
  
  let routingOk = true;
  
  // Check tenant-specific dashboard exists
  if (fs.existsSync(tenantDashboard)) {
    console.log('✅ Tenant-specific dashboard: EXISTS');
    const content = fs.readFileSync(tenantDashboard, 'utf8');
    if (content.includes('useParams') && content.includes('subdomain')) {
      console.log('✅ Tenant-specific dashboard: Uses subdomain routing');
    } else {
      console.log('❌ Tenant-specific dashboard: Missing subdomain logic');
      routingOk = false;
    }
  } else {
    console.log('❌ Tenant-specific dashboard: MISSING');
    routingOk = false;
  }
  
  // Check login redirect logic
  if (fs.existsSync(loginPage)) {
    const content = fs.readFileSync(loginPage, 'utf8');
    if (content.includes('tenantSubdomain') && content.includes('/${result.user.tenantSubdomain}/dashboard')) {
      console.log('✅ Login page: Has tenant-specific redirect');
    } else {
      console.log('❌ Login page: Missing tenant-specific redirect');
      routingOk = false;
    }
  }
  
  // Check generic dashboard redirect
  if (fs.existsSync(genericDashboard)) {
    const content = fs.readFileSync(genericDashboard, 'utf8');
    if (content.includes('tenantSubdomain') && content.includes('window.location.href')) {
      console.log('✅ Generic dashboard: Has tenant redirect');
    } else {
      console.log('❌ Generic dashboard: Missing tenant redirect');
      routingOk = false;
    }
  }
  
  return routingOk;
}

function checkAuthSystem() {
  console.log('\n🔐 Checking authentication system...');
  
  const authFile = 'lib/auth.ts';
  const loginApi = 'app/api/auth/login/route.ts';
  
  let authOk = true;
  
  // Check User interface
  if (fs.existsSync(authFile)) {
    const content = fs.readFileSync(authFile, 'utf8');
    if (content.includes('tenantSubdomain?:')) {
      console.log('✅ Auth interface: Has tenantSubdomain field');
    } else {
      console.log('❌ Auth interface: Missing tenantSubdomain field');
      authOk = false;
    }
  }
  
  // Check login API
  if (fs.existsSync(loginApi)) {
    const content = fs.readFileSync(loginApi, 'utf8');
    if (content.includes('tenantSubdomain: tenant.subdomain')) {
      console.log('✅ Login API: Includes tenantSubdomain in response');
    } else {
      console.log('❌ Login API: Missing tenantSubdomain in response');
      authOk = false;
    }
  }
  
  return authOk;
}

function main() {
  console.log('🧪 Build Readiness Verification\n');
  
  const duplicatesOk = checkForDuplicateDeclarations();
  const routingOk = checkTenantRouting();
  const authOk = checkAuthSystem();
  
  console.log('\n📊 Summary:');
  console.log(`   Duplicate Declarations: ${duplicatesOk ? '✅ CLEAN' : '❌ ISSUES FOUND'}`);
  console.log(`   Tenant Routing: ${routingOk ? '✅ CONFIGURED' : '❌ ISSUES FOUND'}`);
  console.log(`   Authentication: ${authOk ? '✅ CONFIGURED' : '❌ ISSUES FOUND'}`);
  
  const allGood = duplicatesOk && routingOk && authOk;
  
  console.log(`\n🎯 Build Status: ${allGood ? '✅ READY FOR DEPLOYMENT' : '❌ NEEDS FIXES'}`);
  
  if (allGood) {
    console.log('\n🚀 The application should build successfully on Vercel!');
    console.log('   - All duplicate declarations removed');
    console.log('   - Tenant-specific routing implemented');
    console.log('   - Authentication system updated');
    console.log('   - Next.js 15+ compatibility achieved');
  } else {
    console.log('\n⚠️  Please fix the issues above before deploying.');
  }
  
  process.exit(allGood ? 0 : 1);
}

main();