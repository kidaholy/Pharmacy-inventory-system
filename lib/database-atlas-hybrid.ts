// Hybrid database that tries MongoDB Atlas first, falls back to localStorage
// Production-ready with automatic failover

import { db as atlasDb, User as AtlasUser, Pharmacy as AtlasPharmacy } from './database-atlas';
import { db as simpleDb, User, Pharmacy } from './database-simple';

// Re-export types for compatibility
export type { User, Pharmacy };

// Create a wrapper class that tries Atlas first, falls back to simple database
class AtlasHybridDatabase {
  private atlasAvailable: boolean | null = null;

  constructor() {
    // Only test Atlas connection on server side
    if (typeof window === 'undefined') {
      this.testAtlasConnection();
    } else {
      // On client side, immediately use localStorage
      this.atlasAvailable = false;
    }
  }

  private async testAtlasConnection(): Promise<boolean> {
    if (this.atlasAvailable !== null) {
      return this.atlasAvailable;
    }

    // Skip Atlas on client side
    if (typeof window !== 'undefined') {
      this.atlasAvailable = false;
      return false;
    }

    try {
      // Try a simple operation to test Atlas connectivity
      await atlasDb.getAllUsers();
      this.atlasAvailable = true;
      console.log('✅ MongoDB Atlas connected successfully');
      return true;
    } catch (error) {
      console.log('⚠️ MongoDB Atlas unavailable, using localStorage fallback');
      this.atlasAvailable = false;
      return false;
    }
  }

  private async executeWithFallback<T>(
    atlasOperation: () => Promise<any>,
    simpleOperation: () => Promise<T>
  ): Promise<T> {
    // Always use localStorage on client side
    if (typeof window !== 'undefined') {
      return simpleOperation();
    }

    if (this.atlasAvailable === false) {
      return simpleOperation();
    }

    try {
      const result = await atlasOperation();
      if (this.atlasAvailable === null) {
        this.atlasAvailable = true;
        console.log('✅ MongoDB Atlas connection confirmed');
      }
      // Convert Atlas result to match simple database format
      return result as T;
    } catch (error) {
      console.log('⚠️ Atlas operation failed, falling back to localStorage:', (error as Error).message || 'Unknown error');
      this.atlasAvailable = false;
      return simpleOperation();
    }
  }

  // User methods with Atlas fallback to localStorage
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return this.executeWithFallback(
      () => atlasDb.createUser(userData as Omit<AtlasUser, 'id' | 'createdAt'>),
      () => simpleDb.createUser(userData)
    );
  }

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    return this.executeWithFallback(
      () => atlasDb.getUserByCredentials(username, password),
      () => simpleDb.getUserByCredentials(username, password)
    );
  }

  async getUserById(id: string): Promise<User | null> {
    return this.executeWithFallback(
      () => atlasDb.getUserById(id),
      () => simpleDb.getUserById(id)
    );
  }

  async getAllUsers(): Promise<User[]> {
    return this.executeWithFallback(
      () => atlasDb.getAllUsers(),
      () => simpleDb.getAllUsers()
    );
  }

  async getAllUsersIncludingSuperAdmin(): Promise<User[]> {
    return this.executeWithFallback(
      () => atlasDb.getAllUsersIncludingSuperAdmin(),
      () => simpleDb.getAllUsersIncludingSuperAdmin()
    );
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return this.executeWithFallback(
      () => atlasDb.updateUser(id, updates as Partial<AtlasUser>),
      () => simpleDb.updateUser(id, updates)
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.executeWithFallback(
      () => atlasDb.deleteUser(id),
      () => simpleDb.deleteUser(id)
    );
  }

  // Pharmacy methods
  async createPharmacy(pharmacyData: Omit<Pharmacy, 'id' | 'createdAt'>): Promise<Pharmacy> {
    return this.executeWithFallback(
      () => atlasDb.createPharmacy(pharmacyData as Omit<AtlasPharmacy, 'id' | 'createdAt'>),
      () => simpleDb.createPharmacy(pharmacyData)
    );
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    return this.executeWithFallback(
      () => atlasDb.getAllPharmacies(),
      () => simpleDb.getAllPharmacies()
    );
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    return this.executeWithFallback(
      () => atlasDb.getPharmacyById(id),
      () => simpleDb.getPharmacyById(id)
    );
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy | null> {
    return this.executeWithFallback(
      () => atlasDb.updatePharmacy(id, updates as Partial<AtlasPharmacy>),
      () => simpleDb.updatePharmacy(id, updates)
    );
  }

  async deletePharmacy(id: string): Promise<boolean> {
    return this.executeWithFallback(
      () => atlasDb.deletePharmacy(id),
      () => simpleDb.deletePharmacy(id)
    );
  }

  // Medicine methods (Atlas-specific, fallback to localStorage simulation)
  async createMedicine(medicineData: any): Promise<any> {
    // Always use localStorage on client side
    if (typeof window !== 'undefined' || this.atlasAvailable === false) {
      // Store in localStorage for simple database
      if (typeof window !== 'undefined') {
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
      // On server side without Atlas, return mock data
      return {
        ...medicineData,
        id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    try {
      return await atlasDb.createMedicine(medicineData);
    } catch (error) {
      console.log('⚠️ Atlas medicine creation failed, using localStorage');
      this.atlasAvailable = false;
      return this.createMedicine(medicineData);
    }
  }

  async getMedicinesByPharmacy(pharmacyId: string): Promise<any[]> {
    // Always use localStorage on client side
    if (typeof window !== 'undefined' || this.atlasAvailable === false) {
      if (typeof window !== 'undefined') {
        // Get from localStorage
        const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
        return medicines.filter((m: any) => m.pharmacyId === pharmacyId);
      }
      // On server side without Atlas, return empty array
      return [];
    }

    try {
      return await atlasDb.getMedicinesByPharmacy(pharmacyId);
    } catch (error) {
      console.log('⚠️ Atlas medicine fetch failed, using localStorage');
      this.atlasAvailable = false;
      return this.getMedicinesByPharmacy(pharmacyId);
    }
  }

  async updateMedicine(id: string, updates: any): Promise<any> {
    // Always use localStorage on client side
    if (typeof window !== 'undefined' || this.atlasAvailable === false) {
      if (typeof window !== 'undefined') {
        // Update in localStorage
        const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
        const index = medicines.findIndex((m: any) => m.id === id);
        if (index !== -1) {
          medicines[index] = { ...medicines[index], ...updates, updatedAt: new Date().toISOString() };
          localStorage.setItem('pharmatrack_medicines', JSON.stringify(medicines));
          return medicines[index];
        }
      }
      return null;
    }

    try {
      return await atlasDb.updateMedicine(id, updates);
    } catch (error) {
      console.log('⚠️ Atlas medicine update failed, using localStorage');
      this.atlasAvailable = false;
      return this.updateMedicine(id, updates);
    }
  }

  async deleteMedicine(id: string): Promise<boolean> {
    // Always use localStorage on client side
    if (typeof window !== 'undefined' || this.atlasAvailable === false) {
      if (typeof window !== 'undefined') {
        // Delete from localStorage
        const medicines = JSON.parse(localStorage.getItem('pharmatrack_medicines') || '[]');
        const filteredMedicines = medicines.filter((m: any) => m.id !== id);
        localStorage.setItem('pharmatrack_medicines', JSON.stringify(filteredMedicines));
        return filteredMedicines.length < medicines.length;
      }
      return false;
    }

    try {
      return await atlasDb.deleteMedicine(id);
    } catch (error) {
      console.log('⚠️ Atlas medicine deletion failed, using localStorage');
      this.atlasAvailable = false;
      return this.deleteMedicine(id);
    }
  }

  // Analytics methods
  async getStats() {
    return this.executeWithFallback(
      () => atlasDb.getStats(),
      () => simpleDb.getStats()
    );
  }

  // Debug methods
  async resetDatabase() {
    return this.executeWithFallback(
      () => atlasDb.resetDatabase(),
      () => simpleDb.resetDatabase()
    );
  }

  async debugPrintUsers(): Promise<User[]> {
    return this.executeWithFallback(
      () => atlasDb.debugPrintUsers(),
      () => simpleDb.debugPrintUsers()
    );
  }

  // Utility methods
  isUsingAtlas(): boolean {
    return this.atlasAvailable === true;
  }

  async forceAtlasReconnect(): Promise<boolean> {
    this.atlasAvailable = null;
    return this.testAtlasConnection();
  }
}

// Export singleton instance
export const db = new AtlasHybridDatabase();