import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICmsContent extends Document {
    tenantId: Types.ObjectId;
    hero: {
        title: string;
        subtitle: string;
        image: string;
    };
    services: Array<{
        title: string;
        description: string;
        image: string;
        icon?: string;
    }>;
    stats: Array<{
        label: string;
        value: string;
    }>;
    testimonials: Array<{
        name: string;
        text: string;
        rating: number;
        avatar?: string;
    }>;
    faq: Array<{
        question: string;
        answer: string;
    }>;
    contact: {
        message: string;
        businessHours?: string;
    };
    updatedAt: Date;
}

const CmsContentSchema: Schema = new Schema({
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        unique: true
    },
    hero: {
        title: { type: String, default: 'Pharmacy <br /><span class="text-medi-lime">Perfected.</span>' },
        subtitle: { type: String, default: 'Experience the future of pharmaceutical care. We combine expert knowledge with cutting-edge logistics for your family.' },
        image: { type: String, default: '/pharmacist.png' }
    },
    services: [{
        title: String,
        description: String,
        image: String,
        icon: String
    }],
    stats: [{
        label: String,
        value: String
    }],
    testimonials: [{
        name: String,
        text: String,
        rating: { type: Number, default: 5 },
        avatar: String
    }],
    faq: [{
        question: String,
        answer: String
    }],
    contact: {
        message: { type: String, default: 'Get In Touch' },
        businessHours: { type: String, default: 'Mon - Sat: 8AM - 8PM' }
    }
}, {
    timestamps: true
});

export default mongoose.models.CmsContent || mongoose.model<ICmsContent>('CmsContent', CmsContentSchema);
