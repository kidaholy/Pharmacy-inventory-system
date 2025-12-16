import mongoose from 'mongoose';
import { connectToDatabase } from '../mongodb-atlas';
import Tenant, { ITenant } from '../models/Tenant';
import MultiTenantUser, { IMultiTenantUser } from '../models/MultiTenantUser';
import Medicine, { IMedicine } from '../models/Medicine';
import Prescription, { IPrescription } from '../models/Prescription';
import { PasswordUtils } from '../password-utils';

export class MultiTenantDatabaseService {
  private static instance: MultiTenantDatabaseService;
  
  private constructor() {}
  
  public static getInstance(): MultiTenantDatabaseService {
    if (!MultiTenantDatabaseService.instance) {
      MultiTenantDatabaseService.instance = new MultiTenantDatabaseService();
    }
    return MultiTenantDatabaseService.instance;
  }

  async ensureConnection() {
    await connectToDatabase();
  }

  // Tenant Management
  async createTenant(tenantData: Partial<ITenant>): Promise<ITenant> {
    await this.ensureConnection();
    const tenant = new Tenant(tenantData);
    return await tenant.save();
  }

  async getTenantBySubdomain(subdomain: string): Promise<ITenant | null> {
    await this.ensureConnection();
    return await Tenant.findOne({ subdomain, isActive: true });
  }

  async getTenantById(tenantId: string): Promise<ITenant | null> {
    await this.ensureConnection();
    return await Tenant.findById(tenantId);
  }

  async updateTenant(tenantId: string, updates: Partial<ITenant>): Promise<ITenant | null> {
    await this.ensureConnection();
    return await Tenant.findByIdAndUpdate(tenantId, updates, { new: true });
  }

  async getAllTenants(): Promise<ITenant[]> {
    await this.ensureConnection();
    return await Tenant.find({ isActive: true }).sort({ createdAt: -1 });
  }

  // User Management (Multi-tenant)
  async createUser(tenantId: string, userData: Partial<IMultiTenantUser>): Promise<IMultiTenantUser> {
    await this.ensureConnection();
    
    // Hash the password before saving
    if (userData.password) {
      userData.password = await PasswordUtils.hashPassword(userData.password);
    }
    
    const user = new MultiTenantUser({ ...userData, tenantId });
    return await user.save();
  }

  async getUserByCredentials(tenantId: string, email: string, password: string): Promise<IMultiTenantUser | null> {
    await this.ensureConnection();
    
    // Find user by email and tenant (don't include password in query)
    const user = await MultiTenantUser.findOne({
      tenantId,
      email,
      isActive: true
    });

    if (user && !user.isLocked()) {
      // Verify password using bcrypt
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
      
      if (isPasswordValid) {
        // Update login info
        user.security.lastLogin = new Date();
        user.security.failedLoginAttempts = 0;
        await user.save();
        return user;
      } else {
        // Increment failed login attempts
        user.security.failedLoginAttempts += 1;
        
        // Lock account after 5 failed attempts for 30 minutes
        if (user.security.failedLoginAttempts >= 5) {
          user.security.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        await user.save();
        return null;
      }
    }

    return null;
  }

  async getUserById(tenantId: string, userId: string): Promise<IMultiTenantUser | null> {
    await this.ensureConnection();
    return await MultiTenantUser.findOne({ _id: userId, tenantId });
  }

  async getUsersByTenant(tenantId: string): Promise<IMultiTenantUser[]> {
    await this.ensureConnection();
    return await MultiTenantUser.find({ tenantId, isActive: true }).sort({ createdAt: -1 });
  }

  async getAllUsersByTenant(tenantId: string): Promise<IMultiTenantUser[]> {
    await this.ensureConnection();
    return await MultiTenantUser.find({ tenantId }).sort({ createdAt: -1 });
  }

  // Super Admin Methods (tenant-independent)
  async getSuperAdminByEmail(email: string): Promise<IMultiTenantUser | null> {
    await this.ensureConnection();
    return await MultiTenantUser.findOne({ 
      email, 
      role: 'super_admin',
      isActive: true 
    });
  }

  async verifyUserPassword(user: IMultiTenantUser, password: string): Promise<boolean> {
    try {
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
      
      if (isPasswordValid) {
        // Update login info
        user.security.lastLogin = new Date();
        user.security.failedLoginAttempts = 0;
        await user.save();
        return true;
      } else {
        // Increment failed login attempts
        user.security.failedLoginAttempts += 1;
        
        // Lock account after 5 failed attempts for 30 minutes
        if (user.security.failedLoginAttempts >= 5) {
          user.security.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        await user.save();
        return false;
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  async createSuperAdmin(userData: Partial<IMultiTenantUser>): Promise<IMultiTenantUser> {
    await this.ensureConnection();
    
    // Hash the password before saving
    if (userData.password) {
      userData.password = await PasswordUtils.hashPassword(userData.password);
    }
    
    // Super admin doesn't need a tenant - completely tenant-independent
    const superAdmin = new MultiTenantUser({ 
      ...userData, 
      tenantId: null, // Super admin is tenant-independent
      role: 'super_admin'
    });
    
    return await superAdmin.save();
  }

  async updateUser(tenantId: string, userId: string, updates: Partial<IMultiTenantUser>): Promise<IMultiTenantUser | null> {
    await this.ensureConnection();
    
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await PasswordUtils.hashPassword(updates.password);
      updates.passwordResetToken = undefined;
      updates.passwordResetExpires = undefined;
      if (updates.security) {
        updates.security.lastPasswordChange = new Date();
      } else {
        updates.security = {
          lastPasswordChange: new Date(),
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
          recoveryTokens: []
        };
      }
    }
    
    return await MultiTenantUser.findOneAndUpdate(
      { _id: userId, tenantId },
      updates,
      { new: true }
    );
  }

  async updateUserPassword(tenantId: string, userId: string, newPassword: string): Promise<boolean> {
    await this.ensureConnection();
    
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);
    
    const result = await MultiTenantUser.findOneAndUpdate(
      { _id: userId, tenantId },
      { 
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        'security.lastPasswordChange': new Date(),
        'security.failedLoginAttempts': 0,
        'security.lockedUntil': undefined
      },
      { new: true }
    );
    
    return !!result;
  }

  async deleteUser(tenantId: string, userId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await MultiTenantUser.findOneAndUpdate(
      { _id: userId, tenantId },
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  // Medicine Management (Multi-tenant)
  async createMedicine(tenantId: string, medicineData: Partial<IMedicine>): Promise<IMedicine> {
    await this.ensureConnection();
    const medicine = new Medicine({ ...medicineData, tenantId });
    return await medicine.save();
  }

  async getMedicinesByTenant(tenantId: string, filters?: any): Promise<IMedicine[]> {
    await this.ensureConnection();
    const query = { tenantId, isActive: true, ...filters };
    return await Medicine.find(query).sort({ name: 1 });
  }

  async getMedicineById(tenantId: string, medicineId: string): Promise<IMedicine | null> {
    await this.ensureConnection();
    return await Medicine.findOne({ _id: medicineId, tenantId, isActive: true });
  }

  async updateMedicine(tenantId: string, medicineId: string, updates: Partial<IMedicine>): Promise<IMedicine | null> {
    await this.ensureConnection();
    return await Medicine.findOneAndUpdate(
      { _id: medicineId, tenantId },
      { ...updates, 'dates.lastUpdated': new Date() },
      { new: true }
    );
  }

  async deleteMedicine(tenantId: string, medicineId: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Medicine.findOneAndUpdate(
      { _id: medicineId, tenantId },
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async searchMedicines(tenantId: string, searchTerm: string): Promise<IMedicine[]> {
    await this.ensureConnection();
    return await Medicine.find({
      tenantId,
      isActive: true,
      $text: { $search: searchTerm }
    }).sort({ score: { $meta: 'textScore' } });
  }

  async getLowStockMedicines(tenantId: string): Promise<IMedicine[]> {
    await this.ensureConnection();
    return await Medicine.find({
      tenantId,
      isActive: true,
      $expr: { $lte: ['$stock.current', '$stock.minimum'] }
    }).sort({ 'stock.current': 1 });
  }

  async getExpiringMedicines(tenantId: string, days: number = 90): Promise<IMedicine[]> {
    await this.ensureConnection();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return await Medicine.find({
      tenantId,
      isActive: true,
      'dates.expiryDate': { $lte: expiryDate }
    }).sort({ 'dates.expiryDate': 1 });
  }

  // Prescription Management (Multi-tenant)
  async createPrescription(tenantId: string, prescriptionData: Partial<IPrescription>): Promise<IPrescription> {
    await this.ensureConnection();
    const prescription = new Prescription({ ...prescriptionData, tenantId });
    return await prescription.save();
  }

  async getPrescriptionsByTenant(tenantId: string, filters?: any): Promise<IPrescription[]> {
    await this.ensureConnection();
    const query = { tenantId, isActive: true, ...filters };
    return await Prescription.find(query)
      .populate('medicines.medicineId')
      .sort({ 'dates.received': -1 });
  }

  async getPrescriptionById(tenantId: string, prescriptionId: string): Promise<IPrescription | null> {
    await this.ensureConnection();
    return await Prescription.findOne({ _id: prescriptionId, tenantId, isActive: true })
      .populate('medicines.medicineId');
  }

  async updatePrescription(tenantId: string, prescriptionId: string, updates: Partial<IPrescription>): Promise<IPrescription | null> {
    await this.ensureConnection();
    return await Prescription.findOneAndUpdate(
      { _id: prescriptionId, tenantId },
      updates,
      { new: true }
    ).populate('medicines.medicineId');
  }

  async updatePrescriptionStatus(tenantId: string, prescriptionId: string, status: string, dispensedBy?: string): Promise<IPrescription | null> {
    await this.ensureConnection();
    const updates: any = { status };
    
    if (status === 'dispensed') {
      updates['dates.dispensed'] = new Date();
      if (dispensedBy) {
        updates.dispensedBy = dispensedBy;
      }
    }
    
    return await this.updatePrescription(tenantId, prescriptionId, updates);
  }

  // Analytics and Reports
  async getTenantStats(tenantId: string) {
    await this.ensureConnection();
    
    const [
      totalUsers,
      totalMedicines,
      totalPrescriptions,
      lowStockCount,
      expiringCount,
      pendingPrescriptions
    ] = await Promise.all([
      MultiTenantUser.countDocuments({ tenantId, isActive: true }),
      Medicine.countDocuments({ tenantId, isActive: true }),
      Prescription.countDocuments({ tenantId, isActive: true }),
      Medicine.countDocuments({
        tenantId,
        isActive: true,
        $expr: { $lte: ['$stock.current', '$stock.minimum'] }
      }),
      Medicine.countDocuments({
        tenantId,
        isActive: true,
        'dates.expiryDate': { $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) }
      }),
      Prescription.countDocuments({ tenantId, status: 'pending', isActive: true })
    ]);

    const totalInventoryValue = await Medicine.aggregate([
      { $match: { tenantId: tenantId, isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$stock.current', '$pricing.sellingPrice'] }
          }
        }
      }
    ]);

    return {
      totalUsers,
      totalMedicines,
      totalPrescriptions,
      lowStockCount,
      expiringCount,
      pendingPrescriptions,
      totalInventoryValue: totalInventoryValue[0]?.totalValue || 0
    };
  }

  // Utility Methods
  async generatePrescriptionNumber(tenantId: string): Promise<string> {
    await this.ensureConnection();
    const count = await Prescription.countDocuments({ tenantId });
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `RX${year}${month}${(count + 1).toString().padStart(4, '0')}`;
  }

  async checkTenantLimits(tenantId: string): Promise<{
    users: { current: number; limit: number; exceeded: boolean };
    medicines: { current: number; limit: number; exceeded: boolean };
    prescriptions: { current: number; limit: number; exceeded: boolean };
  }> {
    await this.ensureConnection();
    
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const [userCount, medicineCount, prescriptionCount] = await Promise.all([
      MultiTenantUser.countDocuments({ tenantId, isActive: true }),
      Medicine.countDocuments({ tenantId, isActive: true }),
      Prescription.countDocuments({ tenantId, isActive: true })
    ]);

    return {
      users: {
        current: userCount,
        limit: tenant.settings.limits.users,
        exceeded: userCount >= tenant.settings.limits.users
      },
      medicines: {
        current: medicineCount,
        limit: tenant.settings.limits.medicines,
        exceeded: medicineCount >= tenant.settings.limits.medicines
      },
      prescriptions: {
        current: prescriptionCount,
        limit: tenant.settings.limits.prescriptions,
        exceeded: prescriptionCount >= tenant.settings.limits.prescriptions
      }
    };
  }
}

export const multiTenantDb = MultiTenantDatabaseService.getInstance();