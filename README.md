# PharmaSuite Cloud

Multi-tenant pharmacy inventory management and point of sale (POS) SaaS system built with Next.js 14, MongoDB, and modern React ecosystem.

## Features

- **Multi-Tenant Architecture**: Isolated data per pharmacy using tenant IDs
- **Authentication**: Secure JWT-based authentication with NextAuth.js
- **Dashboard**: Real-time overview of sales, inventory, and alerts
- **POS System**: Fast and intuitive point of sale interface
- **Inventory Management**: Track products, batches, and stock levels
- **Purchase Orders**: Manage supplier orders and receiving
- **Prescriptions**: Handle prescription processing and validation
- **Reports**: Comprehensive analytics and reporting
- **User Management**: Role-based access control
- **Admin Panel**: SaaS management for tenant administration

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v3, shadcn/ui components
- **State Management**: Zustand, TanStack Query
- **Authentication**: NextAuth.js with JWT
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Real-time**: Socket.io (to be implemented)

## Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd pharmasuite-cloud
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configure environment variables in `.env`:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/pharmasuite
MONGODB_DB=pharmasuite
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
NODE_ENV=development
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
pharmasuite-cloud/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (tenant)/          # Tenant-specific pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   ├── providers/        # Context providers
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # Authentication config
│   │   ├── db.ts             # Database connection
│   │   ├── tenant.ts         # Multi-tenant utilities
│   │   └── validations.ts    # Zod schemas
│   └── models/                # MongoDB models
│       ├── Tenant.ts
│       ├── User.ts
│       ├── Product.ts
│       ├── Batch.ts
│       ├── Sale.ts
│       ├── Supplier.ts
│       ├── PurchaseOrder.ts
│       └── Prescription.ts
├── public/                    # Static assets
└── package.json
\`\`\`

## Database Models

### Core Models

- **Tenant**: Pharmacy/tenant information and settings
- **User**: User accounts with role-based permissions
- **Product**: Product catalog with details
- **Batch**: Inventory batches with expiry tracking
- **Sale**: Sales transactions and invoices
- **Supplier**: Supplier information
- **PurchaseOrder**: Purchase order management
- **Prescription**: Prescription processing

## Multi-Tenancy

The system uses a shared database with tenant isolation:

- Each document includes a `tenantId` field
- Middleware extracts tenant from subdomain or session
- All queries are automatically scoped to the tenant
- Admin panel accessible via `admin.` subdomain

## Authentication & Authorization

- JWT-based authentication with NextAuth.js
- Role-based access control (Admin, Manager, Cashier, Pharmacist)
- Protected routes with middleware
- Session management

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (via NextAuth)

### Products (To be implemented)
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Sales (To be implemented)
- `POST /api/sales` - Create sale
- `GET /api/sales` - List sales
- `GET /api/sales/[id]` - Get sale details

## Development Roadmap

### Phase 1: Core Setup ✅
- [x] Project initialization
- [x] Database models
- [x] Authentication system
- [x] Basic layout and navigation
- [x] Dashboard page

### Phase 2: Product Management (Next)
- [ ] Product CRUD operations
- [ ] Product search and filters
- [ ] Batch management
- [ ] Stock adjustment

### Phase 3: POS System
- [ ] POS interface
- [ ] Barcode scanning
- [ ] Cart management
- [ ] Payment processing
- [ ] Receipt generation

### Phase 4: Inventory & Orders
- [ ] Purchase order creation
- [ ] Receiving inventory
- [ ] Supplier management
- [ ] Low stock alerts
- [ ] Expiry tracking

### Phase 5: Prescriptions & Reports
- [ ] Prescription processing
- [ ] Sales reports
- [ ] Inventory reports
- [ ] Profit analysis

### Phase 6: Admin Panel
- [ ] Tenant management
- [ ] Billing system
- [ ] License management
- [ ] Analytics dashboard

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@pharmasuite.com or open an issue in the repository.