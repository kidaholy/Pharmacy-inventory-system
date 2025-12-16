// MongoDB-based database with localStorage fallback
// This provides a seamless transition from localStorage to MongoDB

import { db as mongoDb, User, Pharmacy } from './database-mongo';

// Re-export types for compatibility
export type { User, Pharmacy };

// Create a wrapper class that tries MongoDB first, falls back to localStorage
class HybridDatabase {
  private useLocalStorage = false;
  private localUsers: User[] = [];
  private localPharmacies: Pharmacy[] = [];

  constructor() {
    // Try to detect if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.loadLocalData();
      this.initializeLocalSuperAdmin();
    }
  }

  private loadLocalData() {
    const usersData = localStorage.getItem('pharmatrack_users');
    const pharmaciesData = localStorage.getItem('pharmatrack_pharmacies');
    
    if (usersData) {
      this.localUsers = JSON.parse(usersData);
    }
    
    if (pharmaciesData) {
      this.localPharmacies = JSON.parse(pharmaciesData);
    }
  }

  private saveLocalData() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pharmatrack_users', JSON.stringify(this.localUsers));
      localStorage.setItem('pharmatrack_pharmacies', JSON.stringify(this.localPharmacies));
    }
  }

  private initializeLocalSuperAdmin() {
    const existingSuperAdmin = this.localUsers.find(user => user.role === 'super_admin');
    
    if (!existingSuperAdmin) {
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

      this.localUsers.push(superAdmin, demoUser);
      this.saveLocalData();
    }
  }

  // User methods with MongoDB fallback to localStorage
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      return await mongoDb.createUser(userData);
    } catch (error) {
      console.log('MongoDB unavailable, using localStorage');
      const user: User = {
        ...userData,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString()
      };
      
      this.localUsers.push(user);
      this.saveLocalData();
      return user;
    }
  }

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    try {
      return await mongoDb.getUserByCredentials(username, password);
    } catch (error) {
      console.log('MongoDB unavailable, using localStorage');
      const user = this.localUsers.find(u => 
        (u.username === username || u.email === username) && 
        u.password === password && 
        u.isActive
      );
      
      if (user) {
        user.lastLogin = new Date().toISOString();
        this.saveLocalData();
      }
      
      return user || null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await mongoDb.getUserById(id);
    } catch (error) {
      return this.localUsers.find(u => u.id === id) || null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await mongoDb.getAllUsers();
    } catch (error) {
      return this.localUsers.filter(u => u.role !== 'super_admin');
    }
  }

  async getAllUsersIncludingSuperAdmin(): Promise<User[]> {
    try {
      return await mongoDb.getAllUsersIncludingSuperAdmin();
    } catch (error) {
      return this.localUsers;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await mongoDb.updateUser(id, updates);
    } catch (error) {
      const userIndex = this.localUsers.findIndex(u => u.id === id);
      if (userIndex === -1) return null;
      
      this.localUsers[userIndex] = { ...this.localUsers[userIndex], ...updates };
      this.saveLocalData();
      return this.localUsers[userIndex];
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      return await mongoDb.deleteUser(id);
    } catch (error) {
      const userIndex = this.localUsers.findIndex(u => u.id === id);
      if (userIndex === -1) return false;
      
      this.localUsers.splice(userIndex, 1);
      this.saveLocalData();
      return true;
    }
  }

  // Pharmacy methods
  async createPharmacy(pharmacyData: Omit<Pharmacy, 'id' | 'createdAt'>): Promise<Pharmacy> {
    try {
      return await mongoDb.createPharmacy(pharmacyData);
    } catch (error) {
      const pharmacy: Pharmacy = {
        ...pharmacyData,
        id: `pharmacy_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString()
      };
      
      this.localPharmacies.push(pharmacy);
      this.saveLocalData();
      return pharmacy;
    }
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    try {
      return await mongoDb.getAllPharmacies();
    } catch (error) {
      return this.localPharmacies;
    }
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    try {
      return await mongoDb.getPharmacyById(id);
    } catch (error) {
      return this.localPharmacies.find(p => p.id === id) || null;
    }
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy | null> {
    try {
      return await mongoDb.updatePharmacy(id, updates);
    } catch (error) {
      const pharmacyIndex = this.localPharmacies.findIndex(p => p.id === id);
      if (pharmacyIndex === -1) return null;
      
      this.localPharmacies[pharmacyIndex] = { ...this.localPharmacies[pharmacyIndex], ...updates };
      this.saveLocalData();
      return this.localPharmacies[pharmacyIndex];
    }
  }

  async deletePharmacy(id: string): Promise<boolean> {
    try {
      return await mongoDb.deletePharmacy(id);
    } catch (error) {
      const pharmacyIndex = this.localPharmacies.findIndex(p => p.id === id);
      if (pharmacyIndex === -1) return false;
      
      this.localPharmacies.splice(pharmacyIndex, 1);
      this.saveLocalData();
      return true;
    }
  }

  // Analytics methods
  async getStats() {
    try {
      return await mongoDb.getStats();
    } catch (error) {
      return {
        totalUsers: this.localUsers.length - 1,
        totalPharmacies: this.localPharmacies.length,
        activePharmacies: this.localPharmacies.filter(p => p.isActive).length,
        subscriptionBreakdown: {
          starter: this.localPharmacies.filter(p => p.subscriptionPlan === 'starter').length,
          professional: this.localPharmacies.filter(p => p.subscriptionPlan === 'professional').length,
          enterprise: this.localPharmacies.filter(p => p.subscriptionPlan === 'enterprise').length
        }
      };
    }
  }

  // Debug methods
  async resetDatabase() {
    try {
      await mongoDb.resetDatabase();
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pharmatrack_users');
        localStorage.removeItem('pharmatrack_pharmacies');
      }
      this.localUsers = [];
      this.localPharmacies = [];
      this.initializeLocalSuperAdmin();
    }
  }

  async debugPrintUsers(): Promise<User[]> {
    try {
      return await mongoDb.debugPrintUsers();
    } catch (error) {
      console.log('All users in database:', this.localUsers);
      return this.localUsers;
    }
  }
}

// Export singleton instance
export const db = new HybridDatabase();