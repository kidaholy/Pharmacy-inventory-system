import mongoose from 'mongoose';
import Category from '../models/Category';
import Tenant from '../models/Tenant';
import Medicine from '../models/Medicine';
import MultiTenantUser from '../models/MultiTenantUser';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kidayos2014:holyunion@cluster0.5b5mudf.mongodb.net/pharmacy?retryWrites=true&w=majority';

class AutoSaveDatabase {
    private static instance: AutoSaveDatabase;
    private isConnected = false;

    constructor() {
        this.ensureConnection();
    }

    static getInstance(): AutoSaveDatabase {
        if (!AutoSaveDatabase.instance) {
            AutoSaveDatabase.instance = new AutoSaveDatabase();
        }
        return AutoSaveDatabase.instance;
    }

    async ensureConnection(): Promise<void> {
        if (this.isConnected && mongoose.connection.readyState === 1) {
            return;
        }

        try {
            if (mongoose.connection.readyState === 0) {
                await mongoose.connect(MONGODB_URI, {
                    bufferCommands: false,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                });
            }
            
            this.isConnected = true;
            console.log('✅ Auto-save database connected to MongoDB Atlas');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }

    // CATEGORY OPERATIONS
    async createCategory(tenantId: string, categoryData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            const category = new Category({
                ...categoryData,
                tenantId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const savedCategory = await category.save();
            console.log('✅ Category auto-saved to MongoDB Atlas:', savedCategory.name);
            
            return savedCategory;
        } catch (error) {
            console.error('❌ Auto-save CREATE failed:', error);
            throw error;
        }
    }

    async getCategories(tenantId: string): Promise<any[]> {
        await this.ensureConnection();
        
        try {
            const categories = await Category.find({
                tenantId,
                isActive: true
            }).sort({ name: 1 }).lean();

            console.log(`✅ Categories auto-loaded from MongoDB Atlas: ${categories.length} found`);
            return categories;
        } catch (error) {
            console.error('❌ Auto-load READ failed:', error);
            throw error;
        }
    }

    async updateCategory(categoryId: string, tenantId: string, updateData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            const updatedCategory = await Category.findOneAndUpdate(
                { _id: categoryId, tenantId, isActive: true },
                {
                    ...updateData,
                    updatedAt: new Date()
                },
                { 
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedCategory) {
                throw new Error('Category not found or access denied');
            }

            console.log('✅ Category auto-updated in MongoDB Atlas:', updatedCategory.name);
            return updatedCategory;
        } catch (error) {
            console.error('❌ Auto-save UPDATE failed:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId: string, tenantId: string): Promise<boolean> {
        await this.ensureConnection();
        
        try {
            const deletedCategory = await Category.findOneAndUpdate(
                { _id: categoryId, tenantId, isActive: true },
                {
                    isActive: false,
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!deletedCategory) {
                throw new Error('Category not found or already deleted');
            }

            console.log('✅ Category auto-deleted in MongoDB Atlas:', deletedCategory.name);
            return true;
        } catch (error) {
            console.error('❌ Auto-save DELETE failed:', error);
            throw error;
        }
    }

    // MEDICINE OPERATIONS
    async createMedicine(tenantId: string, medicineData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            // Create a placeholder user ID for createdBy/updatedBy
            const placeholderUserId = new mongoose.Types.ObjectId();
            
            const medicine = new Medicine({
                tenantId,
                name: medicineData.name,
                genericName: medicineData.genericName || '',
                brandName: medicineData.brandName || '',
                category: medicineData.category,
                subcategory: medicineData.subcategory || '',
                description: medicineData.description || '',
                dosage: medicineData.dosage || 'As directed',
                strength: medicineData.strength || '',
                form: medicineData.form || 'tablet',
                manufacturer: medicineData.manufacturer || 'Unknown',
                supplier: medicineData.supplier || 'Unknown',
                batchNumber: medicineData.batchNumber || 'BATCH-' + Date.now(),
                barcode: medicineData.barcode || '',
                sku: medicineData.sku || '',
                stock: {
                    current: medicineData.quantity || 0,
                    minimum: medicineData.reorderLevel || 10,
                    maximum: medicineData.maxStock || null,
                    reserved: 0,
                    available: medicineData.quantity || 0
                },
                pricing: {
                    costPrice: medicineData.costPrice || medicineData.price || 0,
                    sellingPrice: medicineData.price || 0,
                    mrp: medicineData.mrp || medicineData.price || 0,
                    discount: medicineData.discount || 0,
                    tax: medicineData.tax || 0
                },
                dates: {
                    manufactureDate: medicineData.manufactureDate ? new Date(medicineData.manufactureDate) : null,
                    expiryDate: new Date(medicineData.expiryDate),
                    receivedDate: medicineData.receivedDate ? new Date(medicineData.receivedDate) : new Date(),
                    lastUpdated: new Date()
                },
                storage: {
                    location: medicineData.storageLocation || '',
                    rackNumber: medicineData.rackNumber || '',
                    temperature: medicineData.storageConditions || 'room temperature',
                    humidity: medicineData.humidity || '',
                    specialInstructions: medicineData.storageInstructions || ''
                },
                regulatory: {
                    drugLicenseNumber: medicineData.drugLicenseNumber || '',
                    scheduleType: medicineData.scheduleType || '',
                    prescriptionRequired: medicineData.prescriptionRequired || false,
                    controlledSubstance: medicineData.controlledSubstance || false
                },
                composition: medicineData.composition || [],
                sideEffects: medicineData.sideEffects ? medicineData.sideEffects.split(',').map(s => s.trim()) : [],
                contraindications: medicineData.contraindications ? medicineData.contraindications.split(',').map(s => s.trim()) : [],
                interactions: medicineData.interactions ? medicineData.interactions.split(',').map(s => s.trim()) : [],
                warnings: medicineData.warnings ? medicineData.warnings.split(',').map(s => s.trim()) : [],
                images: medicineData.images || [],
                documents: medicineData.documents || [],
                tags: medicineData.tags ? medicineData.tags.split(',').map(s => s.trim()) : [],
                isActive: true,
                createdBy: placeholderUserId,
                updatedBy: placeholderUserId
            });

            const savedMedicine = await medicine.save();
            console.log('✅ Medicine auto-saved to MongoDB Atlas:', savedMedicine.name);
            
            return savedMedicine;
        } catch (error) {
            console.error('❌ Auto-save Medicine CREATE failed:', error);
            throw error;
        }
    }

    async getMedicines(tenantId: string, filters: any = {}): Promise<any[]> {
        await this.ensureConnection();
        
        try {
            const query: any = {
                tenantId,
                isActive: true
            };

            // Apply filters
            if (filters.category) {
                query.category = filters.category;
            }
            if (filters.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: 'i' } },
                    { genericName: { $regex: filters.search, $options: 'i' } },
                    { brandName: { $regex: filters.search, $options: 'i' } },
                    { manufacturer: { $regex: filters.search, $options: 'i' } }
                ];
            }
            if (filters.lowStock) {
                query.$expr = { $lte: ['$stock.current', '$stock.minimum'] };
            }
            if (filters.expiring) {
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                query['dates.expiryDate'] = { $lte: thirtyDaysFromNow };
            }

            const medicines = await Medicine.find(query)
                .sort({ name: 1 })
                .limit(filters.limit || 100)
                .skip(filters.offset || 0)
                .lean();

            console.log(`✅ Medicines auto-loaded from MongoDB Atlas: ${medicines.length} found`);
            return medicines;
        } catch (error) {
            console.error('❌ Auto-load Medicine READ failed:', error);
            throw error;
        }
    }

    async getMedicineById(medicineId: string, tenantId: string): Promise<any> {
        await this.ensureConnection();
        
        try {
            const medicine = await Medicine.findOne({
                _id: medicineId,
                tenantId,
                isActive: true
            }).lean();

            if (medicine) {
                console.log('✅ Medicine auto-loaded from MongoDB Atlas:', medicine.name);
            }
            return medicine;
        } catch (error) {
            console.error('❌ Auto-load Medicine by ID failed:', error);
            throw error;
        }
    }

    async updateMedicine(medicineId: string, tenantId: string, updateData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            const placeholderUserId = new mongoose.Types.ObjectId();
            
            const updateFields: any = {
                name: updateData.name,
                genericName: updateData.genericName || '',
                brandName: updateData.brandName || '',
                category: updateData.category,
                subcategory: updateData.subcategory || '',
                description: updateData.description || '',
                dosage: updateData.dosage || 'As directed',
                strength: updateData.strength || '',
                form: updateData.form || 'tablet',
                manufacturer: updateData.manufacturer || 'Unknown',
                supplier: updateData.supplier || 'Unknown',
                batchNumber: updateData.batchNumber || 'BATCH-' + Date.now(),
                barcode: updateData.barcode || '',
                sku: updateData.sku || '',
                'stock.current': updateData.quantity || 0,
                'stock.minimum': updateData.reorderLevel || 10,
                'stock.available': updateData.quantity || 0,
                'pricing.costPrice': updateData.costPrice || updateData.price || 0,
                'pricing.sellingPrice': updateData.price || 0,
                'pricing.mrp': updateData.mrp || updateData.price || 0,
                'pricing.discount': updateData.discount || 0,
                'pricing.tax': updateData.tax || 0,
                'dates.expiryDate': new Date(updateData.expiryDate),
                'dates.lastUpdated': new Date(),
                'storage.location': updateData.storageLocation || '',
                'storage.temperature': updateData.storageConditions || 'room temperature',
                'regulatory.prescriptionRequired': updateData.prescriptionRequired || false,
                'regulatory.controlledSubstance': updateData.controlledSubstance || false,
                sideEffects: updateData.sideEffects ? updateData.sideEffects.split(',').map(s => s.trim()) : [],
                contraindications: updateData.contraindications ? updateData.contraindications.split(',').map(s => s.trim()) : [],
                updatedBy: placeholderUserId
            };

            if (updateData.manufactureDate) {
                updateFields['dates.manufactureDate'] = new Date(updateData.manufactureDate);
            }

            const updatedMedicine = await Medicine.findOneAndUpdate(
                { _id: medicineId, tenantId, isActive: true },
                { $set: updateFields },
                { 
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedMedicine) {
                throw new Error('Medicine not found or access denied');
            }

            console.log('✅ Medicine auto-updated in MongoDB Atlas:', updatedMedicine.name);
            return updatedMedicine;
        } catch (error) {
            console.error('❌ Auto-save Medicine UPDATE failed:', error);
            throw error;
        }
    }

    async deleteMedicine(medicineId: string, tenantId: string): Promise<boolean> {
        await this.ensureConnection();
        
        try {
            const deletedMedicine = await Medicine.findOneAndUpdate(
                { _id: medicineId, tenantId, isActive: true },
                {
                    isActive: false,
                    updatedBy: new mongoose.Types.ObjectId(),
                    'dates.lastUpdated': new Date()
                },
                { new: true }
            );

            if (!deletedMedicine) {
                throw new Error('Medicine not found or already deleted');
            }

            console.log('✅ Medicine auto-deleted in MongoDB Atlas:', deletedMedicine.name);
            return true;
        } catch (error) {
            console.error('❌ Auto-save Medicine DELETE failed:', error);
            throw error;
        }
    }

    // USER MANAGEMENT OPERATIONS
    async createUser(tenantId: string, userData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            const placeholderUserId = new mongoose.Types.ObjectId();
            
            const user = new mongoose.model('MultiTenantUser')({
                tenantId: tenantId ? new mongoose.Types.ObjectId(tenantId) : null,
                username: userData.username,
                email: userData.email,
                password: userData.password, // Should be hashed in production
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'user',
                permissions: userData.permissions || [],
                profile: userData.profile || {},
                preferences: userData.preferences || {
                    theme: 'light',
                    language: 'en',
                    timezone: 'UTC',
                    notifications: {
                        email: true,
                        sms: false,
                        push: true,
                        lowStock: true,
                        expiry: true,
                        prescriptions: true
                    }
                },
                security: userData.security || {
                    failedLoginAttempts: 0,
                    twoFactorEnabled: false,
                    recoveryTokens: []
                },
                isActive: true,
                isEmailVerified: false,
                createdBy: placeholderUserId,
                updatedBy: placeholderUserId
            });

            const savedUser = await user.save();
            console.log('✅ User auto-saved to MongoDB Atlas:', savedUser.email);
            
            return savedUser;
        } catch (error) {
            console.error('❌ Auto-save User CREATE failed:', error);
            throw error;
        }
    }

    async getUserById(tenantId: string | null, userId: string): Promise<any> {
        await this.ensureConnection();
        
        try {
            const query: any = { _id: userId };
            
            if (tenantId && tenantId !== 'null' && tenantId !== 'undefined') {
                query.tenantId = new mongoose.Types.ObjectId(tenantId);
            } else {
                query.tenantId = null;
            }

            const user = await mongoose.model('MultiTenantUser').findOne(query).lean();
            
            if (user) {
                console.log('✅ User auto-loaded from MongoDB Atlas:', user.email);
            }
            return user;
        } catch (error) {
            console.error('❌ Auto-load User READ failed:', error);
            throw error;
        }
    }

    async getUsersByTenant(tenantId: string): Promise<any[]> {
        await this.ensureConnection();
        
        try {
            const users = await mongoose.model('MultiTenantUser').find({
                tenantId: new mongoose.Types.ObjectId(tenantId),
                isActive: true
            }).lean();

            console.log(`✅ Users auto-loaded from MongoDB Atlas: ${users.length} found`);
            return users;
        } catch (error) {
            console.error('❌ Auto-load Users READ failed:', error);
            throw error;
        }
    }

    async updateUser(tenantId: string | null, userId: string, updateData: any): Promise<any> {
        await this.ensureConnection();
        
        try {
            const query: any = { _id: userId };
            
            if (tenantId && tenantId !== 'null' && tenantId !== 'undefined') {
                query.tenantId = new mongoose.Types.ObjectId(tenantId);
            } else {
                query.tenantId = null;
            }

            const updatedUser = await mongoose.model('MultiTenantUser').findOneAndUpdate(
                query,
                {
                    ...updateData,
                    updatedBy: new mongoose.Types.ObjectId(),
                    updatedAt: new Date()
                },
                { 
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedUser) {
                throw new Error('User not found or access denied');
            }

            console.log('✅ User auto-updated in MongoDB Atlas:', updatedUser.email);
            return updatedUser;
        } catch (error) {
            console.error('❌ Auto-save User UPDATE failed:', error);
            throw error;
        }
    }

    async softDeleteUser(tenantId: string | null, userId: string): Promise<boolean> {
        await this.ensureConnection();
        
        try {
            const query: any = { _id: userId };
            
            if (tenantId && tenantId !== 'null' && tenantId !== 'undefined') {
                query.tenantId = new mongoose.Types.ObjectId(tenantId);
            } else {
                query.tenantId = null;
            }

            const deletedUser = await mongoose.model('MultiTenantUser').findOneAndUpdate(
                query,
                {
                    isActive: false,
                    updatedBy: new mongoose.Types.ObjectId(),
                    updatedAt: new Date()
                },
                { new: true }
            );

            if (!deletedUser) {
                throw new Error('User not found');
            }

            console.log('✅ User auto-deactivated in MongoDB Atlas:', deletedUser.email);
            return true;
        } catch (error) {
            console.error('❌ Auto-save User SOFT DELETE failed:', error);
            throw error;
        }
    }

    async hardDeleteUser(tenantId: string | null, userId: string): Promise<boolean> {
        await this.ensureConnection();
        
        try {
            const query: any = { _id: userId };
            
            if (tenantId && tenantId !== 'null' && tenantId !== 'undefined') {
                query.tenantId = new mongoose.Types.ObjectId(tenantId);
            } else {
                query.tenantId = null;
            }

            const deletedUser = await mongoose.model('MultiTenantUser').findOneAndDelete(query);

            if (!deletedUser) {
                throw new Error('User not found');
            }

            console.log('✅ User auto-deleted from MongoDB Atlas:', deletedUser.email);
            return true;
        } catch (error) {
            console.error('❌ Auto-save User HARD DELETE failed:', error);
            throw error;
        }
    }

    async deleteUserPermanently(tenantId: string | null, userId: string): Promise<boolean> {
        await this.ensureConnection();
        
        try {
            // First, get user info for logging
            const userToDelete = await this.getUserById(tenantId, userId);
            if (!userToDelete) {
                throw new Error('User not found');
            }

            // Perform hard delete from MongoDB Atlas
            const deleted = await this.hardDeleteUser(tenantId, userId);
            
            if (deleted) {
                console.log('✅ User permanently deleted from MongoDB Atlas:', userToDelete.email);
                
                // Optional: Clean up related data
                // You can add cleanup for user-related data here
                // await this.cleanupUserRelatedData(userId);
            }
            
            return deleted;
        } catch (error) {
            console.error('❌ Permanent user deletion failed:', error);
            throw error;
        }
    }
    async getTenantBySubdomain(subdomain: string): Promise<any> {
        await this.ensureConnection();
        
        try {
            const tenant = await Tenant.findOne({ subdomain }).lean();
            if (tenant) {
                console.log('✅ Tenant auto-loaded from MongoDB Atlas:', tenant.name);
            }
            return tenant;
        } catch (error) {
            console.error('❌ Tenant lookup failed:', error);
            throw error;
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.ensureConnection();
            const isHealthy = mongoose.connection.readyState === 1;
            console.log(`🔍 Auto-save health check: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
            return isHealthy;
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return false;
        }
    }
}

export const autoSaveDb = AutoSaveDatabase.getInstance();