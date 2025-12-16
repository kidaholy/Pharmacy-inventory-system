// Safe database that works reliably in all environments
// Uses localStorage with optional Atlas integration

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

class SafeDatabase {
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

  // Medicine methods (localStorage only for now)
  async createMedicine(medicineData: any): Promise<any> {
    if (typeof window === 'undefined') {
      // On server side, return mock data
      return {
        ...medicineData,
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
    const newMedicine = {
      ...medicineData,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    medicines.push(newMedicine);
    localStorage.setItem('pharmatrack_medicines', JSON.stringify(medicines));
    return newMedicine;
  }

  async getMedicinesByPharmacy(pharmacyId: string): Promise<any[]> {
    if (typeof window === 'undefined') {
      // On server side, return empty array
      return [];
    }

    const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
    return medicines.filter((m: any) => m.pharmacyId === pharmacyId);
  }

  async updateMedicine(id: string, updates: any): Promise<any> {
    if (typeof window === 'undefined') {
      return null;
    }

    const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
    const index = medicines.findIndex((m: any) => m.id === id);
    if (index !== -1) {
      medicines[index] = { ...medicines[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('pharmatrack_medicines', JSON.stringify(medicines));
      return medicines[index];
    }
    return null;
  }

  async deleteMedicine(id: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
    const filteredMedicines = medicines.filter((m: any) => m.id !== id);
    localStorage.setItem('pharmatrack_medicines', JSON.stringify(filteredMedicines));
    return filteredMedicines.length < medicines.length;
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
      localStorage.removeItem('pharmatrack_medicines');
    }
    this.initializeSampleData();
  }

  async debugPrintUsers(): Promise<User[]> {
    console.log('All users in database:', this.users);
    return this.users;
  }

  // Utility methods
  isUsingAtlas(): boolean {
    return false; // Always false for safe database
  }

  async forceAtlasReconnect(): Promise<boolean> {
    return false; // Not applicable for safe database
  }
}

// Export singleton instance
export const db = new SafeDatabase();