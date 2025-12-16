# Database Management Scripts

This directory contains scripts for managing the PharmaTrack database, particularly for cleaning and setting up the system.

## Available Scripts

### 🧹 Clean Database (Keep Super Admin)
```bash
npm run clean-database
# or
node scripts/clean-database-keep-super-admin.js
```
**Purpose**: Removes all data from the database except the super admin user and their system tenant.

**What it does**:
- Removes all users except the super admin (kidayos2014@gmail.com)
- Removes ALL tenants (super admin doesn't need one)
- Removes all medicines, prescriptions, inventory, sales, customers, suppliers, reports, and notifications
- Preserves the super admin's authentication and system access

### 👑 Setup Super Admin Only
```bash
npm run setup-super-admin
# or
node scripts/setup-super-admin-only.js
```
**Purpose**: Creates or updates the super admin user with a system tenant.

**What it does**:
- Creates or updates the super admin user (kidayos2014@gmail.com)
- Makes super admin tenant-independent (no tenant association)
- Sets up proper permissions and security settings
- Ensures password is properly hashed with bcrypt

### ✅ Verify Clean State
```bash
npm run verify-state
# or
node scripts/verify-clean-state.js
```
**Purpose**: Verifies the current state of the database and confirms it's clean.

**What it shows**:
- Count of all records in each collection
- Super admin status and details
- Overall system cleanliness status
- Login credentials for super admin

## Usage Workflow

### To Clean the System Completely:
1. **Clean the database**: `npm run clean-database`
2. **Verify the state**: `npm run verify-state`
3. **Setup super admin** (if needed): `npm run setup-super-admin`

### Expected Clean State:
- **Users**: 1 (super admin only)
- **Tenants**: 0 (super admin is tenant-independent)
- **All other collections**: 0 records

### Super Admin Login:
- **Email**: kidayos2014@gmail.com
- **Password**: password
- **Role**: super_admin
- **Tenant**: None (tenant-independent)
- **Access**: Full system access, can manage all tenants

## Dashboard Behavior

When the system is in a clean state:
- Super admin sees a special "Clean System State" message
- Dashboard shows options to register new pharmacies
- Regular pharmacy management features are hidden until data exists
- Super admin panel access is prominently displayed

## Security Notes

- All passwords are hashed using bcrypt with 12 salt rounds
- Super admin has tenant-independent authentication
- System tenant provides administrative context
- Failed login attempts are tracked and accounts can be locked

## Troubleshooting

If you encounter issues:
1. Check your `.env.local` file has the correct `MONGODB_URI`
2. Ensure MongoDB Atlas connection is working
3. Run `npm run verify-state` to check current system status
4. Re-run `npm run setup-super-admin` if super admin is missing
### 
🧪 Test Pharmacy Registration
```bash
npm run test-registration
# or
node scripts/test-pharmacy-registration.js
```
**Purpose**: Tests the complete pharmacy registration and login flow.

**What it tests**:
- Pharmacy registration with all required data
- Admin user creation for the pharmacy
- Login functionality for the pharmacy owner
- Tenant data retrieval for dashboard display
- Ensures no demo data is present

## Pharmacy Owner Experience

When a pharmacy owner registers and logs in:

1. **Registration**: Creates a new tenant with their pharmacy details
2. **Login**: Authenticates and gets their tenant-specific data
3. **Dashboard**: Shows their pharmacy information, not demo data
4. **Navigation**: Access to inventory, prescriptions, and reports for their pharmacy only

### Expected Pharmacy Owner Dashboard:
- Shows their registered pharmacy name and details
- Displays real statistics from their tenant data
- No demo data or placeholder content
- Full access to pharmacy management features

### 🔍 Test Real Data Only
```bash
npm run test-real-data
# or
node scripts/test-real-data-only.js
```
**Purpose**: Verifies that registered users only see their real pharmacy data, no demo content.

**What it tests**:
- Creates a test pharmacy with real data
- Adds real medicines to the pharmacy
- Tests API responses for tenant-specific data
- Verifies no demo data is present
- Cleans up test data afterwards