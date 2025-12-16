# MongoDB Atlas Multi-Tenant Setup Guide

This guide will help you set up MongoDB Atlas with a multi-tenant architecture for PharmaTrack.

## 🚀 Quick Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "PharmaTrack"

### Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "Shared" (Free tier) or "Dedicated" for production
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "pharmatrack-cluster")
5. Click "Create Cluster"

### Step 3: Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set database user privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string
6. Replace `<password>` with your database user passw
### Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Replace the MongoDB URI with your connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@pharmatrack-cluster.xxxxx.mongodb.net/pharmatrack?retryWrites=true&w=majority
```

Replace:
- `<username>` with your database username
- `<password>` with your database password
- `pharmatrack-cluster.xxxxx` with your actual cluster name

## 🏗️ Multi-Tenant Architecture

### Database Structure

```
pharmatrack (database)
├── tenants (collection)
├── users (collection)
├── pharmacies (collection)
├── medicines (collection)
├── prescriptions (collection)
└── patients (collection)
```

### Tenant Isolation

Each document includes a `tenantId` field for data isolation:

```javascript
// Example document structure
{
  _id: ObjectId("..."),
  tenantId: ObjectId("..."), // Links to tenant
  // ... other fields
}
```

### Subscription Plans

| Plan | Users | Medicines | Prescriptions | Storage | Price |
|------|-------|-----------|---------------|---------|-------|
| Starter | 5 | 1,000 | 10,000 | 100MB | Free |
| Professional | 25 | 10,000 | 100,000 | 1GB | $29/month |
| Enterprise | Unlimited | Unlimited | Unlimited | 10GB | $99/month |

## 🔧 Setup Script

Run the setup script to initialize the database:

```bash
npm run setup-atlas
```

This will:
- Create the super admin user
- Set up indexes for performance
- Create sample tenant data (in development)

## 📊 Collections Overview

### Tenants Collection
- Stores pharmacy/organization information
- Subscription plan and billing details
- Custom branding and settings
- Contact information and address

### Users Collection
- Multi-tenant user management
- Role-based access control
- User preferences and profiles
- Tenant-scoped authentication

### Pharmacies Collection
- Physical pharmacy locations
- Operating hours and services
- License and certification info
- Contact details and address

### Medicines Collection
- Complete medicine catalog
- Inventory tracking
- Batch and expiry management
- Pricing and supplier info

### Prescriptions Collection
- Patient prescription records
- Medication details and instructions
- Billing and payment tracking
- Status and workflow management

## 🔐 Security Features

### Data Isolation
- Tenant-scoped queries prevent data leakage
- Row-level security through tenantId filtering
- Separate user namespaces per tenant

### Access Control
- Role-based permissions system
- API-level tenant validation
- Secure authentication and sessions

### Compliance
- HIPAA-ready data handling
- Audit trails for all operations
- Encrypted sensitive data fields

## 🚀 Deployment

### Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your MongoDB Atlas connection string

# Initialize database
npm run setup-atlas

# Start development server
npm run dev
```

### Production
```bash
# Build application
npm run build

# Start production server
npm start
```

## 📈 Monitoring

### Atlas Monitoring
- Real-time performance metrics
- Query performance insights
- Storage and connection monitoring
- Automated alerts and notifications

### Application Metrics
- Tenant usage statistics
- API performance monitoring
- Error tracking and logging
- User activity analytics

## 🔧 Maintenance

### Backup Strategy
- Atlas automatic backups (enabled by default)
- Point-in-time recovery
- Cross-region backup replication
- Custom backup schedules

### Scaling
- Automatic scaling with Atlas
- Read replicas for performance
- Sharding for large datasets
- Connection pooling optimization

## 🆘 Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check network access whitelist
   - Verify connection string format
   - Ensure cluster is running

2. **Authentication Failed**
   - Verify username and password
   - Check user permissions
   - Ensure user has database access

3. **Slow Queries**
   - Review query patterns
   - Add appropriate indexes
   - Use Atlas Performance Advisor

4. **Storage Limits**
   - Monitor storage usage
   - Implement data archiving
   - Upgrade cluster tier if needed

### Support Resources
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Community Forums](https://community.mongodb.com/)
- [Support Portal](https://support.mongodb.com/)

## 🎯 Next Steps

1. Set up your MongoDB Atlas cluster
2. Configure environment variables
3. Run the setup script
4. Test the multi-tenant functionality
5. Deploy to production

The multi-tenant architecture provides complete data isolation while maintaining performance and scalability for your pharmacy management system.