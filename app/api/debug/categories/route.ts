import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/database-atlas';
import Category from '../../../../lib/models/Category';
import Tenant from '../../../../lib/models/Tenant';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        // The db instance handles connection automatically
        console.log('🔍 Checking categories in MongoDB Atlas...');
        console.log('📊 Database name:', mongoose.connection.db?.databaseName);
        console.log('🔗 Connection state:', mongoose.connection.readyState);
        
        // Get all collections in the database
        const collections = await mongoose.connection.db?.listCollections().toArray();
        console.log('📁 Available collections:', collections?.map(c => c.name));
        
        // Check if categories collection exists
        const categoriesCollectionExists = collections?.some(c => c.name === 'categories');
        console.log('📂 Categories collection exists:', categoriesCollectionExists);
        
        // Count total categories
        const totalCategories = await Category.countDocuments();
        console.log('📊 Total categories in database:', totalCategories);
        
        // Get all categories (limit to 20 for safety)
        const categories = await Category.find({}).limit(20).lean();
        console.log('📋 Categories found:', categories);
        
        // Get all tenants for reference
        const tenants = await Tenant.find({}).select('name subdomain').lean();
        console.log('🏢 Available tenants:', tenants);
        
        // Group categories by tenant
        const categoriesByTenant = {};
        for (const category of categories) {
            const tenant = tenants.find(t => t._id.toString() === category.tenantId?.toString());
            const tenantKey = tenant ? `${tenant.name} (${tenant.subdomain})` : 'Unknown Tenant';
            
            if (!categoriesByTenant[tenantKey]) {
                categoriesByTenant[tenantKey] = [];
            }
            categoriesByTenant[tenantKey].push({
                name: category.name,
                description: category.description,
                isActive: category.isActive,
                createdAt: category.createdAt
            });
        }
        
        return NextResponse.json({
            success: true,
            database: {
                name: mongoose.connection.db?.databaseName,
                connectionState: mongoose.connection.readyState,
                connectionStates: {
                    0: 'disconnected',
                    1: 'connected',
                    2: 'connecting',
                    3: 'disconnecting'
                }
            },
            collections: collections?.map(c => c.name) || [],
            categories: {
                collectionExists: categoriesCollectionExists,
                totalCount: totalCategories,
                byTenant: categoriesByTenant,
                allCategories: categories
            },
            tenants: tenants.map(t => ({
                id: t._id,
                name: t.name,
                subdomain: t.subdomain
            }))
        });
        
    } catch (error) {
        console.error('❌ Error checking categories:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}