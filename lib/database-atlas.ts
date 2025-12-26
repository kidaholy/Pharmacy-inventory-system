// MongoDB Atlas database with localStorage fallback
// Production-ready database service for PharmaTrack

import mongoose from 'mongoose';
import User, { IUser } from './models/User';
import Pharmacy, { IPharmacy } from './models/Pharmacy';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmatrack?retryWrites=true&w=majority';

export interface UserData {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'pharmacist' | 'user' | 'tenant_admin';
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

export interface MedicineData {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  supplier: string;
  batchNumber: string;
  description?: string;
  dosage?: string;
  manufacturer?: string;
  pharmacyId: string;
  createdAt: string;
  updatedAt: string;
}

// Medicine Schema
const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  minStock: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  batchNumber: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dosage: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  pharmacyId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for better performance
if (typeof window === 'undefined') {
  try {
    MedicineSchema.index({ pharmacyId: 1 });
    MedicineSchema.index({ category: 1 });
    MedicineSchema.index({ name: 1 });
    MedicineSchema.index({ expiryDate: 1 });
    MedicineSchema.index({ stock: 1 });
  } catch (error) {
    console.log('Index creation skipped (likely in browser environment)');
  }
}

const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', MedicineSchema);

class AtlasDatabase {
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // Only try to connect on server side or when explicitly called
    if (typeof window === 'undefined') {
      this.connect();
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Skip connection in browser environment
    if (typeof window !== 'undefined') {
      throw new Error('MongoDB connection not available in browser');
    }

    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<void> {
    try {
      await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
      this.isConnected = true;
      console.log('Connected to MongoDB Atlas successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB Atlas:', error);
      this.isConnected = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
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
      address: typeof pharmacy.address === 'string' ? pharmacy.address : `${pharmacy.address.street}, ${pharmacy.address.city}`,
      phone: (pharmacy as any).phone || 'N/A',
      email: (pharmacy as any).email || 'N/A',
      subscriptionPlan: (pharmacy as any).subscriptionPlan || 'starter',
      isActive: pharmacy.isActive,
      createdAt: pharmacy.createdAt.toISOString()
    };
  }

  private convertMedicineToData(medicine: any): MedicineData {
    return {
      id: medicine._id.toString(),
      name: medicine.name,
      category: medicine.category,
      stock: medicine.stock,
      minStock: medicine.minStock,
      price: medicine.price,
      expiryDate: medicine.expiryDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      supplier: medicine.supplier,
      batchNumber: medicine.batchNumber,
      description: medicine.description,
      dosage: medicine.dosage,
      manufacturer: medicine.manufacturer,
      pharmacyId: medicine.pharmacyId,
      createdAt: medicine.createdAt.toISOString(),
      updatedAt: medicine.updatedAt.toISOString()
    };
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
    await this.ensureConnection();
    try {
      const user = await User.findById(id);
      return user ? this.convertUserToData(user) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<UserData[]> {
    await this.ensureConnection();
    try {
      const users = await User.find({ role: { $ne: 'super_admin' } });
      return users.map(user => this.convertUserToData(user));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getAllUsersIncludingSuperAdmin(): Promise<UserData[]> {
    await this.ensureConnection();
    try {
      const users = await User.find({});
      return users.map(user => this.convertUserToData(user));
    } catch (error) {
      console.error('Error getting all users including super admin:', error);
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<UserData>): Promise<UserData | null> {
    await this.ensureConnection();
    try {
      const user = await User.findByIdAndUpdate(id, updates, { new: true });
      return user ? this.convertUserToData(user) : null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.ensureConnection();
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
    await this.ensureConnection();
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
    await this.ensureConnection();
    try {
      const pharmacies = await Pharmacy.find({});
      return pharmacies.map(pharmacy => this.convertPharmacyToData(pharmacy));
    } catch (error) {
      console.error('Error getting all pharmacies:', error);
      return [];
    }
  }

  async getPharmacyById(id: string): Promise<PharmacyData | null> {
    await this.ensureConnection();
    try {
      const pharmacy = await Pharmacy.findById(id);
      return pharmacy ? this.convertPharmacyToData(pharmacy) : null;
    } catch (error) {
      console.error('Error getting pharmacy by ID:', error);
      return null;
    }
  }

  async updatePharmacy(id: string, updates: Partial<PharmacyData>): Promise<PharmacyData | null> {
    await this.ensureConnection();
    try {
      const pharmacy = await Pharmacy.findByIdAndUpdate(id, updates, { new: true });
      return pharmacy ? this.convertPharmacyToData(pharmacy) : null;
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      return null;
    }
  }

  async deletePharmacy(id: string): Promise<boolean> {
    await this.ensureConnection();
    try {
      const result = await Pharmacy.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting pharmacy:', error);
      return false;
    }
  }

  // Medicine methods
  async createMedicine(medicineData: Omit<MedicineData, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicineData> {
    await this.ensureConnection();
    try {
      const medicine = new Medicine({
        ...medicineData,
        expiryDate: new Date(medicineData.expiryDate)
      });
      const savedMedicine = await medicine.save();
      return this.convertMedicineToData(savedMedicine);
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error;
    }
  }

  async getMedicinesByPharmacy(pharmacyId: string): Promise<MedicineData[]> {
    await this.ensureConnection();
    try {
      const medicines = await Medicine.find({ pharmacyId });
      return medicines.map(medicine => this.convertMedicineToData(medicine));
    } catch (error) {
      console.error('Error getting medicines by pharmacy:', error);
      return [];
    }
  }

  async updateMedicine(id: string, updates: Partial<MedicineData>): Promise<MedicineData | null> {
    await this.ensureConnection();
    try {
      const updateData = { ...updates };
      if (updates.expiryDate) {
        updateData.expiryDate = new Date(updates.expiryDate) as any;
      }
      updateData.updatedAt = new Date() as any;

      const medicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true });
      return medicine ? this.convertMedicineToData(medicine) : null;
    } catch (error) {
      console.error('Error updating medicine:', error);
      return null;
    }
  }

  async deleteMedicine(id: string): Promise<boolean> {
    await this.ensureConnection();
    try {
      const result = await Medicine.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return false;
    }
  }

  // Analytics methods
  async getStats() {
    await this.ensureConnection();
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
  private async initializeSampleData(): Promise<void> {
    try {
      // Super Admin
      const superAdmin = new User({
        username: 'superadmin',
        email: 'superadmin@pharmatrack.com',
        password: 'SuperAdmin123!',
        role: 'super_admin',
        isActive: true,
        createdAt: new Date()
      });
      await superAdmin.save();

      // Demo User
      const demoUser = new User({
        username: 'demo_admin',
        email: 'admin@pharmatrack.com',
        password: 'password',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01')
      });
      await demoUser.save();

      // Sample Users and Pharmacies
      const sampleData = [
        {
          user: {
            username: 'john_smith',
            email: 'john.smith@citycentralpharmacy.com',
            password: 'password123',
            role: 'admin',
            isActive: true
          },
          pharmacy: {
            name: 'City Central Pharmacy',
            address: '123 Main Street, Downtown, NY 10001',
            phone: '+1 (555) 123-4567',
            email: 'admin@citycentralpharmacy.com',
            subscriptionPlan: 'professional',
            isActive: true
          }
        },
        {
          user: {
            username: 'sarah_johnson',
            email: 'sarah.johnson@healthpluspharmacy.com',
            password: 'password123',
            role: 'admin',
            isActive: true
          },
          pharmacy: {
            name: 'HealthPlus Pharmacy',
            address: '456 Oak Avenue, Midtown, NY 10002',
            phone: '+1 (555) 234-5678',
            email: 'contact@healthpluspharmacy.com',
            subscriptionPlan: 'enterprise',
            isActive: true
          }
        },
        {
          user: {
            username: 'mike_davis',
            email: 'mike.davis@communitycarepharmacy.com',
            password: 'password123',
            role: 'admin',
            isActive: true
          },
          pharmacy: {
            name: 'Community Care Pharmacy',
            address: '789 Pine Street, Uptown, NY 10003',
            phone: '+1 (555) 345-6789',
            email: 'info@communitycarepharmacy.com',
            subscriptionPlan: 'starter',
            isActive: true
          }
        },
        {
          user: {
            username: 'lisa_wilson',
            email: 'lisa.wilson@mediquickpharmacy.com',
            password: 'password123',
            role: 'admin',
            isActive: false
          },
          pharmacy: {
            name: 'MediQuick Pharmacy',
            address: '321 Elm Street, Eastside, NY 10004',
            phone: '+1 (555) 456-7890',
            email: 'support@mediquickpharmacy.com',
            subscriptionPlan: 'professional',
            isActive: false
          }
        },
        {
          user: {
            username: 'david_brown',
            email: 'david.brown@wellnesspharmacy.com',
            password: 'password123',
            role: 'admin',
            isActive: true
          },
          pharmacy: {
            name: 'Wellness Pharmacy',
            address: '654 Maple Avenue, Westside, NY 10005',
            phone: '+1 (555) 567-8901',
            email: 'hello@wellnesspharmacy.com',
            subscriptionPlan: 'starter',
            isActive: true
          }
        }
      ];

      for (const data of sampleData) {
        const user = new User({
          ...data.user,
          createdAt: new Date()
        });
        const savedUser = await user.save();

        const pharmacy = new Pharmacy({
          ...data.pharmacy,
          ownerId: savedUser._id,
          createdAt: new Date()
        });
        await pharmacy.save();
      }

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  // Debug methods
  async resetDatabase() {
    await this.ensureConnection();
    try {
      await User.deleteMany({});
      await Pharmacy.deleteMany({});
      await Medicine.deleteMany({});
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
export const db = new AtlasDatabase();
export type { UserData as User, PharmacyData as Pharmacy, MedicineData as Medicine };