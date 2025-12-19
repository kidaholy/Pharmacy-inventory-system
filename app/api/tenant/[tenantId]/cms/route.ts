import { NextRequest, NextResponse } from 'next/server';
import { multiTenantDb } from '@/lib/services/multi-tenant-db';
import CmsContent from '@/lib/models/CmsContent';
import Tenant from '@/lib/models/Tenant';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        await multiTenantDb.ensureConnection();
        const { tenantId } = await params;

        // Find the tenant first to get the numeric ID if subdomain was provided
        let tenant = await Tenant.findOne({
            $or: [
                { subdomain: tenantId },
                { _id: tenantId.match(/^[0-9a-fA-F]{24}$/) ? tenantId : undefined }
            ].filter(Boolean)
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Get CMS content or create default if not exists
        let cmsContent = await CmsContent.findOne({ tenantId: tenant._id });

        if (!cmsContent) {
            cmsContent = await CmsContent.create({ tenantId: tenant._id });
        }

        return NextResponse.json(cmsContent);
    } catch (error) {
        console.error('❌ CMS GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        await multiTenantDb.ensureConnection();
        const { tenantId } = await params;
        const body = await request.json();

        // Find the tenant
        let tenant = await Tenant.findOne({
            $or: [
                { subdomain: tenantId },
                { _id: tenantId.match(/^[0-9a-fA-F]{24}$/) ? tenantId : undefined }
            ].filter(Boolean)
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Update or Create CMS content
        const cmsContent = await CmsContent.findOneAndUpdate(
            { tenantId: tenant._id },
            { $set: body },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, cmsContent });
    } catch (error) {
        console.error('❌ CMS PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
