// Simple database that works in both browser and server environments
// Uses localStorage in browser, can be extended for server-side storage

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'pharmacist' | 'user' | 'tenant_admin';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Pharmacy {
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

class SimpleDatabase {
  private users: User[] = [];
  private pharmacies: Pharmacy[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
    this.initializeSampleData();
    this.isInitialized = true;
  }

  private loadFromLocalStorage() {
    try {
      const usersData = localStorage.getItem('pharmatrack_users');
      const pharmaciesData = localStorage.getItem('pharmatrack_pharmacies');
      
      if (usersData) {
        this.users = JSON.parse(usersData);
      }
      
      if (pharmaciesData) {
        this.pharmacies = JSON.parse(pharmaciesData);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pharmatrack_users', JSON.stringify(this.users));
        localStorage.setItem('pharmatrack_pharmacies', JSON.stringify(this.pharmacies));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  private initializeSampleData() {
    // Only initialize if no users exist
    if (this.users.length === 0) {
      const superAdmin: User = {
        id: 'super_admin_001',
        username: 'superadmin',
        email: 'superadmin@pharmatrack.com',
        password: 'SuperAdmin123!',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        isActive: true
      };

      const demoUser: User = {
        id: 'demo_user_001',
        username: 'demo_admin',
        email: 'admin@pharmatrack.com',
        password: 'password',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastLogin: '2024-12-15T10:00:00.000Z',
        isActive: true
      };

      // Sample pharmacy owners
      const sampleUsers: User[] = [
        {
          id: 'user_001',
          username: 'john_smith',
          email: 'john.smith@citycentralpharmacy.com',
          password: 'password123',
          role: 'admin',
          createdAt: '2024-01-15T09:00:00.000Z',
          lastLogin: '2024-12-15T08:30:00.000Z',
          isActive: true
        },
        {
          id: 'user_002',
          username: 'sarah_johnson',
          email: 'sarah.johnson@healthpluspharmacy.com',
          password: 'password123',
          role: 'admin',
          createdAt: '2024-02-20T13:00:00.000Z',
          lastLogin: '2024-12-14T17:45:00.000Z',
          isActive: true
        },
        {
          id: 'user_003',
          username: 'mike_davis',
          email: 'mike.davis@communitycarepharmacy.com',
          password: 'password123',
          role: 'admin',
          createdAt: '2024-03-10T08:00:00.000Z',
          lastLogin: '2024-12-13T12:15:00.000Z',
          isActive: true
        },
        {
          id: 'user_004',
          username: 'lisa_wilson',
          email: 'lisa.wilson@mediquickpharmacy.com',
          password: 'password123',
          role: 'admin',
          createdAt: '2024-04-05T15:30:00.000Z',
          lastLogin: '2024-11-28T10:20:00.000Z',
          isActive: false
        },
        {
          id: 'user_005',
          username: 'david_brown',
          email: 'david.brown@wellnesspharmacy.com',
          password: 'password123',
          role: 'admin',
          createdAt: '2024-05-12T10:00:00.000Z',
          lastLogin: '2024-12-12T14:30:00.000Z',
          isActive: true
        }
      ];

      this.users = [superAdmin, demoUser, ...sampleUsers];

      // Sample pharmacies
      const samplePharmacies: Pharmacy[] = [
        {
          id: 'pharmacy_001',
          name: 'City Central Pharmacy',
          ownerId: 'user_001',
          address: '123 Main Street, Downtown, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'admin@citycentralpharmacy.com',
          subscriptionPlan: 'professional',
          isActive: true,
          createdAt: '2024-01-15T10:00:00.000Z'
        },
        {
          id: 'pharmacy_002',
          name: 'HealthPlus Pharmacy',
          ownerId: 'user_002',
          address: '456 Oak Avenue, Midtown, NY 10002',
          phone: '+1 (555) 234-5678',
          email: 'contact@healthpluspharmacy.com',
          subscriptionPlan: 'enterprise',
          isActive: true,
          createdAt: '2024-02-20T14:30:00.000Z'
        },
        {
          id: 'pharmacy_003',
          name: 'Community Care Pharmacy',
          ownerId: 'user_003',
          address: '789 Pine Street, Uptown, NY 10003',
          phone: '+1 (555) 345-6789',
          email: 'info@communitycarepharmacy.com',
          subscriptionPlan: 'starter',
          isActive: true,
          createdAt: '2024-03-10T09:15:00.000Z'
        },
        {
          id: 'pharmacy_004',
          name: 'MediQuick Pharmacy',
          ownerId: 'user_004',
          address: '321 Elm Street, Eastside, NY 10004',
          phone: '+1 (555) 456-7890',
          email: 'support@mediquickpharmacy.com',
          subscriptionPlan: 'professional',
          isActive: false,
          createdAt: '2024-04-05T16:45:00.000Z'
        },
        {
          id: 'pharmacy_005',
          name: 'Wellness Pharmacy',
          ownerId: 'user_005',
          address: '654 Maple Avenue, Westside, NY 10005',
          phone: '+1 (555) 567-8901',
          email: 'hello@wellnesspharmacy.com',
          subscriptionPlan: 'starter',
          isActive: true,
          createdAt: '2024-05-12T11:20:00.000Z'
        }
      ];

      this.pharmacies = samplePharmacies;
      this.saveToLocalStorage();
    }
  }

  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString()
    };
    
    this.users.push(user);
    this.saveToLocalStorage();
    return user;
  }

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    const user = this.users.find(u => 
      (u.username === username || u.email === username) && 
      u.password === password && 
      u.isActive
    );
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.saveToLocalStorage();
    }
    
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.filter(u => u.role !== 'super_admin');
  }

  async getAllUsersIncludingSuperAdmin(): Promise<User[]> {
    return this.users;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveToLocalStorage();
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    this.saveToLocalStorage();
    return true;
  }

  // Pharmacy methods
  async createPharmacy(pharmacyData: Omit<Pharmacy, 'id' | 'createdAt'>): Promise<Pharmacy> {
    const pharmacy: Pharmacy = {
      ...pharmacyData,
      id: `pharmacy_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString()
    };
    
    this.pharmacies.push(pharmacy);
    this.saveToLocalStorage();
    return pharmacy;
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return this.pharmacies;
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    return this.pharmacies.find(p => p.id === id) || null;
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy | null> {
    const pharmacyIndex = this.pharmacies.findIndex(p => p.id === id);
    if (pharmacyIndex === -1) return null;
    
    this.pharmacies[pharmacyIndex] = { ...this.pharmacies[pharmacyIndex], ...updates };
    this.saveToLocalStorage();
    return this.pharmacies[pharmacyIndex];
  }

  async deletePharmacy(id: string): Promise<boolean> {
    const pharmacyIndex = this.pharmacies.findIndex(p => p.id === id);
    if (pharmacyIndex === -1) return false;
    
    this.pharmacies.splice(pharmacyIndex, 1);
    this.saveToLocalStorage();
    return true;
  }

  // Analytics methods
  async getStats() {
    return {
      totalUsers: this.users.length - 1, // Exclude super admin
      totalPharmacies: this.pharmacies.length,
      activePharmacies: this.pharmacies.filter(p => p.isActive).length,
      subscriptionBreakdown: {
        starter: this.pharmacies.filter(p => p.subscriptionPlan === 'starter').length,
        professional: this.pharmacies.filter(p => p.subscriptionPlan === 'professional').length,
        enterprise: this.pharmacies.filter(p => p.subscriptionPlan === 'enterprise').length
      }
    };
  }

  // Debug methods
  async resetDatabase() {
    this.users = [];
    this.pharmacies = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pharmatrack_users');
      localStorage.removeItem('pharmatrack_pharmacies');
    }
    this.initializeSampleData();
  }

  async debugPrintUsers(): Promise<User[]> {
    console.log('All users in database:', this.users);
    return this.users;
  }
}

// Export singleton instance
export const db = new SimpleDatabase();