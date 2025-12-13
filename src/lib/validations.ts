import { z } from 'zod';

// User validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  brand: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  dosage: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  barcode: z.string().optional(),
  minReorderLevel: z.number().min(0, 'Must be a positive number'),
  isControlledSubstance: z.boolean().default(false),
  retailPrice: z.number().min(0, 'Must be a positive number'),
  image: z.string().optional(),
});

// Batch validation schemas
export const batchSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  batchNo: z.string().min(1, 'Batch number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  purchasePrice: z.number().min(0, 'Must be a positive number'),
  retailPrice: z.number().min(0, 'Must be a positive number'),
  supplierId: z.string().min(1, 'Supplier is required'),
});

// Sale validation schemas
export const saleSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    batchId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    discount: z.number().min(0).default(0),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'mobile']),
  customerId: z.string().optional(),
  prescriptionId: z.string().optional(),
});

// Purchase Order validation schemas
export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    expectedPrice: z.number().min(0),
  })).min(1, 'At least one item is required'),
  expectedArrival: z.string().optional(),
  notes: z.string().optional(),
});

// Supplier validation schemas
export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});