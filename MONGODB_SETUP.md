# MongoDB Setup for PharmaTrack

This guide will help you set up MongoDB for the PharmaTrack application.

## 🚀 Quick Start

### Option 1: Automatic Setup (Recommended)

1. **Install and Start MongoDB**
   ```bash
   # On Windows (using Chocolatey)
   choco install mongodb
   
   # On macOS (using Homebrew)
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb
   ```

2. **Start MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Run Setup Script**
   ```bash
   node scripts/setup-mongodb.js
   ```

### Option 2: Manual Setup

1. **Connect to MongoDB**
   ```bash
   mongosh mongodb://localhost:27017/pharmatrack
   ```

2. **Create Database and Collections**
   ```javascript
   use pharmatrack
   
   // Create users collection with indexes
   db.users.createIndex({ "email": 1 }, { unique: true })
   db.users.createIndex({ "username": 1 }, { unique: true })
   db.users.createIndex({ "role": 1 })
   
   // Create pharmacies collection with indexes
   db.pharmacies.createIndex({ "ownerId": 1 })
   db.pharmacies.createIndex({ "email": 1 })
   db.pharmacies.createIndex({ "subscriptionPlan": 1 })
   ```

3. **Insert Sample Data**
   ```javascript
   // Super Admin
   db.users.insertOne({
     username: "superadmin",
     email: "superadmin@pharmatrack.com",
     password: "SuperAdmin123!",
     role: "super_admin",
     createdAt: new Date(),
     isActive: true
   })
   
   // Demo User
   db.users.insertOne({
     username: "demo_admin",
     email: "admin@pharmatrack.com",
     password: "password",
     role: "admin",
     createdAt: new Date(),
     isActive: true
   })
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```env
MONGODB_URI=mongodb://localhost:27017/pharmatrack
```

### Custom MongoDB Connection

If you're using a different MongoDB setup:

```env
# Local MongoDB with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/pharmatrack

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pharmatrack

# Docker MongoDB
MONGODB_URI=mongodb://localhost:27017/pharmatrack
```

## 🐳 Docker Setup (Alternative)

If you prefer using Docker:

```bash
# Run MongoDB in Docker
docker run -d \
  --name pharmatrack-mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=pharmatrack \
  mongo:latest

# Run setup script
node scripts/setup-mongodb.js
```

## 🔍 Verification

### Check MongoDB Connection

```bash
# Test connection
mongosh mongodb://localhost:27017/pharmatrack --eval "db.runCommand('ping')"
```

### Verify Data

```bash
# Check users
mongosh mongodb://localhost:27017/pharmatrack --eval "db.users.find().pretty()"

# Check collections
mongosh mongodb://localhost:27017/pharmatrack --eval "show collections"
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB not running**
   ```bash
   # Check if MongoDB is running
   ps aux | grep mongod
   
   # Start MongoDB service
   sudo systemctl start mongod
   ```

2. **Connection refused**
   - Verify MongoDB is running on port 27017
   - Check firewall settings
   - Ensure MongoDB is bound to correct IP

3. **Permission denied**
   ```bash
   # Fix MongoDB permissions (Linux/macOS)
   sudo chown -R mongodb:mongodb /var/lib/mongodb
   sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
   ```

4. **Port already in use**
   ```bash
   # Find process using port 27017
   lsof -i :27017
   
   # Kill process if needed
   sudo kill -9 <PID>
   ```

## 🔄 Fallback Behavior

If MongoDB is unavailable, the application will automatically fallback to localStorage:

- ✅ All features work normally
- 📱 Data persists in browser
- 🔄 Seamless transition when MongoDB becomes available

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String (unique),
  password: String,
  role: String, // 'super_admin', 'admin', 'pharmacist', 'user'
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

### Pharmacies Collection
```javascript
{
  _id: ObjectId,
  name: String,
  ownerId: ObjectId, // Reference to User
  address: String,
  phone: String,
  email: String,
  subscriptionPlan: String, // 'starter', 'professional', 'enterprise'
  isActive: Boolean,
  createdAt: Date
}
```

## 🎯 Login Credentials

After setup, use these credentials:

**Super Admin:**
- Email: `superadmin@pharmatrack.com`
- Password: `SuperAdmin123!`

**Demo User:**
- Email: `admin@pharmatrack.com`
- Password: `password`

## 🚀 Next Steps

1. Start your Next.js application: `npm run dev`
2. Visit `http://localhost:3000/login`
3. Use the credentials above to log in
4. Visit `/debug` page to verify database connection

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Visit `/debug` page to test database connectivity
3. Use the "Reset DB" button to reinitialize data
4. Check MongoDB logs: `tail -f /var/log/mongodb/mongod.log`