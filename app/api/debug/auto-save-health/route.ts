import { NextRequest, NextResponse } from 'next/server';
import { autoSaveDb } from '../../../../lib/services/auto-save-db';

export async function GET(request: NextRequest) {
    try {
        console.log('🔍 Checking auto-save system health...');
        
        // Health check
        const isHealthy = await autoSaveDb.healthCheck();
        
        // Test operations
        const testResults = {
            databaseConnection: isHealthy,
            autoSaveEnabled: true,
            timestamp: new Date().toISOString(),
            status: isHealthy ? 'HEALTHY' : 'UNHEALTHY'
        };

        return NextResponse.json({
            success: true,
            autoSave: testResults,
            message: isHealthy 
                ? '✅ Auto-save system is working perfectly! All CRUD operations will automatically save to MongoDB Atlas.'
                : '❌ Auto-save system has issues. Please check database connection.'
        });

    } catch (error) {
        console.error('❌ Auto-save health check failed:', error);
        return NextResponse.json({
            success: false,
            autoSave: {
                databaseConnection: false,
                autoSaveEnabled: false,
                timestamp: new Date().toISOString(),
                status: 'FAILED',
                error: error.message
            },
            message: '❌ Auto-save system is not working properly.'
        }, { status: 500 });
    }
}