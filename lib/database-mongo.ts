import mongoose from 'mongoose';
import User, { IUser } from './models/User';
import Pharmacy, { IPharmacy } from './models/Pharmacy';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmatrack?retryWrites=true&w=majority';

export interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'pharmacist' | 'user';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface PharmacyData {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  phone: string;
  email: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  createdAt: string;
}

class MongoDatabase {
  private isConnected = false;

  constructor() {
    // Only try to connect on server side or when explicitly called
    if (typeof window === 'undefined') {
      this.connect();
    }
  }

  private async connect() {
    if (this.isConnected) {
      return;
    }

    // Skip connection in browser environment
    if (typeof window !== 'undefined') {
      throw new Error('MongoDB connection not available in browser');
    }

    try {
      await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log('Connected to MongoDB successfully');
      await this.initializeSampleData();
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private async initializeSampleData() {
    try {
      // Check if super admin exists
      const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
      
      if (!existingSuperAdmin) {
        console.log('Initializing sample data...');
        
        // Create super admin
        const superAdmin = new User({
          username: 'superadmin',
          email: 'superadmin@pharmatrack.com',
          password: 'SuperAdmin123!',
          role: 'super_admin',
          isActive: true
        });
        await superAdmin.save();

        // Create demo user
        const demoUser = new User({
          username: 'demo_admin',
          email: 'admin@pharmatrack.com',
          password: 'password',
          role: 'admin',
          isActive: true
        });
        await demoUser.save();

        // Create sample pharmacy owners
        const sampleUsers = [
          {
            username: 'john_smith',
            email: 'john.smith@citycentralpharmacy.com',
            password: 'password123',
            role: 'admin' as const,
            isActive: true
          },
          {
            username: 'sarah_johnson',
            email: 'sarah.johnson@healthpluspharmacy.com',
            password: 'password123',
            role: 'admin' as const,
            isActive: true
          },
          {
            username: 'mike_davis',
            email: 'mike.davis@communitycarepharmacy.com',
            password: 'password123',
            role: 'admin' as const,
            isActive: true
          },
          {
            username: 'lisa_wilson',
            email: 'lisa.wilson@mediquickpharmacy.com',
            password: 'password123',
            role: 'admin' as const,
            isActive: false
          },
          {
            username: 'david_brown',
            email: 'david.brown@wellnesspharmacy.com',
            password: 'password123',
            role: 'admin' as const,
            isActive: true
          }
        ];

        const createdUsers = await User.insertMany(sampleUsers);

        // Create sample pharmacies
        const samplePharmacies = [
          {
            name: 'City Central Pharmacy',
            ownerId: createdUsers[0]._id,
            address: '123 Main Street, Downtown, NY 10001',
            phone: '+1 (555) 123-4567',
            email: 'admin@citycentralpharmacy.com',
            subscriptionPlan: 'professional' as const,
            isActive: true
          },
          {
            name: 'HealthPlus Pharmacy',
            ownerId: createdUsers[1]._id,
            address: '456 Oak Avenue, Midtown, NY 10002',
            phone: '+1 (555) 234-5678',
            email: 'contact@healthpluspharmacy.com',
            subscriptionPlan: 'enterprise' as const,
            isActive: true
          },
          {
            name: 'Community Care Pharmacy',
            ownerId: createdUsers[2]._id,
            address: '789 Pine Street, Uptown, NY 10003',
            phone: '+1 (555) 345-6789',
            email: 'info@communitycarepharmacy.com',
            subscriptionPlan: 'starter' as const,
            isActive: true
          },
          {
            name: 'MediQuick Pharmacy',
            ownerId: createdUsers[3]._id,
            address: '321 Elm Street, Eastside, NY 10004',
            phone: '+1 (555) 456-7890',
            email: 'support@mediquickpharmacy.com',
            subscriptionPlan: 'professional' as const,
            isActive: false
          },
          {
            name: 'Wellness Pharmacy',
            ownerId: createdUsers[4]._id,
            address: '654 Maple Avenue, Westside, NY 10005',
            phone: '+1 (555) 567-8901',
            email: 'hello@wellnesspharmacy.com',
            subscriptionPlan: 'starter' as const,
            isActive: true
          }
        ];

        await Pharmacy.insertMany(samplePharmacies);
        console.log('Sample data initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  private convertUserToData(user: IUser): UserData {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      isActive: user.isActive
    };
  }

  private convertPharmacyToData(pharmacy: IPharmacy): PharmacyData {
    return {
      id: pharmacy._id.toString(),
      name: pharmacy.name,
      ownerId: pharmacy.ownerId.toString(),
      address: pharmacy.address,
      phone: pharmacy.phone,
      email: pharmacy.email,
      subscriptionPlan: pharmacy.subscriptionPlan,
      isActive: pharmacy.isActive,
      createdAt: pharmacy.createdAt.toISOString()
    };
  }

  private async ensureConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  // User methods
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<UserData> {
    await this.ensureConnection();
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return this.convertUserToData(savedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByCredentials(username: string, password: string): Promise<UserData | null> {
    await this.ensureConnection();
    try {
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
        password,
        isActive: true
      });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return this.convertUserToData(user);
      }

      return null;
    } catch (error) {
      console.error('Error getting user by credentials:', error);
      return null;
    }
  }

  async getUserById(id: string): Promise<UserData | null> {
    try {
      const user = await User.findById(id);
      return user ? this.convertUserToData(user) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<UserData[]> {
    try {
      const users = await User.find({ role: { $ne: 'super_admin' } });
      return users.map(user => this.convertUserToData(user));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getAllUsersIncludingSuperAdmin(): Promise<UserData[]> {
    try {
      const users = await User.find({});
      return users.map(user => this.convertUserToData(user));
    } catch (error) {
      console.error('Error getting all users including super admin:', error);
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
    try {
      const user = await User.findByIdAndUpdate(id, updates, { new: true });
      return user ? this.convertUserToData(user) : null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Pharmacy methods
  async createPharmacy(pharmacyData: Omit<PharmacyData, 'id' | 'createdAt'>): Promise<PharmacyData> {
    try {
      const pharmacy = new Pharmacy(pharmacyData);
      const savedPharmacy = await pharmacy.save();
      return this.convertPharmacyToData(savedPharmacy);
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      throw error;
    }
  }

  async getAllPharmacies(): Promise<PharmacyData[]> {
    try {
      const pharmacies = await Pharmacy.find({});
      return pharmacies.map(pharmacy => this.convertPharmacyToData(pharmacy));
    } catch (error) {
      console.error('Error getting all pharmacies:', error);
      return [];
    }
  }

  async getPharmacyById(id: string): Promise<PharmacyData | null> {
    try {
      const pharmacy = await Pharmacy.findById(id);
      return pharmacy ? this.convertPharmacyToData(pharmacy) : null;
    } catch (error) {
      console.error('Error getting pharmacy by ID:', error);
      return null;
    }
  }

  async updatePharmacy(id: string, updates: Partial<PharmacyData>): Promise<PharmacyData | null> {
    try {
      const pharmacy = await Pharmacy.findByIdAndUpdate(id, updates, { new: true });
      return pharmacy ? this.convertPharmacyToData(pharmacy) : null;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      return null;
    }
  }

  async deletePharmacy(id: string): Promise<boolean> {
    try {
      const result = await Pharmacy.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      return false;
    }
  }

  // Analytics methods
  async getStats() {
    try {
      const totalUsers = await User.countDocuments({ role: { $ne: 'super_admin' } });
      const totalPharmacies = await Pharmacy.countDocuments({});
      const activePharmacies = await Pharmacy.countDocuments({ isActive: true });
      
      const subscriptionBreakdown = await Pharmacy.aggregate([
        {
          $group: {
            _id: '$subscriptionPlan',
            count: { $sum: 1 }
          }
        }
      ]);

      const breakdown = {
        starter: 0,
        professional: 0,
        enterprise: 0
      };

      subscriptionBreakdown.forEach(item => {
        breakdown[item._id as keyof typeof breakdown] = item.count;
      });

      return {
        totalUsers,
        totalPharmacies,
        activePharmacies,
        subscriptionBreakdown: breakdown
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalUsers: 0,
        totalPharmacies: 0,
        activePharmacies: 0,
        subscriptionBreakdown: {
          starter: 0,
          professional: 0,
          enterprise: 0
        }
      };
    }
  }

  // Debug methods
  async resetDatabase() {
    try {
      await User.deleteMany({});
      await Pharmacy.deleteMany({});
      await this.initializeSampleData();
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  }

  async debugPrintUsers(): Promise<UserData[]> {
    const users = await this.getAllUsersIncludingSuperAdmin();
    console.log('All users in database:', users);
    return users;
  }
}

// Export singleton instance
export const db = new MongoDatabase();
export type { UserData as User, PharmacyData as Pharmacy };