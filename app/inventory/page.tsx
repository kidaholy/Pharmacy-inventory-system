'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User, db } from '../../lib/database-safe';
import Link from 'next/link';

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  supplier: string;
  batchNumber: string;
  description?: string;
  dosage?: string;
  manufacturer?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'expiry' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Form state for adding/editing medicines
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    minStock: 0,
    price: 0,
    expiryDate: '',
    supplier: '',
    batchNumber: '',
    description: '',
    dosage: '',
    manufacturer: ''
  });

  // Load medicines from database (Atlas or localStorage)
  const loadMedicines = async () => {
    try {
      // Try to get medicines from database first
      const medicines = await db.getMedicinesByPharmacy('current_tenant');
      if (medicines && medicines.length > 0) {
        return medicines;
      }
    } catch (error) {
      console.log('Loading from localStorage fallback');
    }

    // Return empty array if no database data available
    // No localStorage fallback - use proper tenant-based data only
    
    // Sample medicine data if none exists
    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        stock: 150,
        minStock: 50,
        price: 2.50,
        expiryDate: '2025-12-31',
        supplier: 'PharmaCorp',
        batchNumber: 'PC2024001',
        description: 'Pain and fever relief medication',
        dosage: '500mg tablets',
        manufacturer: 'PharmaCorp Ltd',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        stock: 25,
        minStock: 30,
        price: 8.75,
        expiryDate: '2025-06-15',
        supplier: 'MediSupply',
        batchNumber: 'MS2024002',
        description: 'Broad-spectrum antibiotic',
        dosage: '250mg capsules',
        manufacturer: 'MediSupply Inc',
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: '2024-02-01T10:00:00.000Z'
      },
      {
        id: '3',
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        stock: 200,
        minStock: 75,
        price: 3.25,
        expiryDate: '2026-03-20',
        supplier: 'PharmaCorp',
        batchNumber: 'PC2024003',
        description: 'Anti-inflammatory pain reliever',
        dosage: '400mg tablets',
        manufacturer: 'PharmaCorp Ltd',
        createdAt: '2024-02-15T10:00:00.000Z',
        updatedAt: '2024-02-15T10:00:00.000Z'
      },
      {
        id: '4',
        name: 'Omeprazole 20mg',
        category: 'Digestive',
        stock: 80,
        minStock: 40,
        price: 12.50,
        expiryDate: '2025-09-10',
        supplier: 'HealthPlus',
        batchNumber: 'HP2024001',
        description: 'Proton pump inhibitor for acid reflux',
        dosage: '20mg capsules',
        manufacturer: 'HealthPlus Pharma',
        createdAt: '2024-03-01T10:00:00.000Z',
        updatedAt: '2024-03-01T10:00:00.000Z'
      },
      {
        id: '5',
        name: 'Cetirizine 10mg',
        category: 'Antihistamine',
        stock: 15,
        minStock: 25,
        price: 5.00,
        expiryDate: '2025-08-05',
        supplier: 'MediSupply',
        batchNumber: 'MS2024004',
        description: 'Antihistamine for allergies',
        dosage: '10mg tablets',
        manufacturer: 'MediSupply Inc',
        createdAt: '2024-03-15T10:00:00.000Z',
        updatedAt: '2024-03-15T10:00:00.000Z'
      },
      {
        id: '6',
        name: 'Metformin 500mg',
        category: 'Diabetes',
        stock: 120,
        minStock: 50,
        price: 4.75,
        expiryDate: '2025-11-30',
        supplier: 'DiabetesCare',
        batchNumber: 'DC2024001',
        description: 'Type 2 diabetes medication',
        dosage: '500mg tablets',
        manufacturer: 'DiabetesCare Ltd',
        createdAt: '2024-04-01T10:00:00.000Z',
        updatedAt: '2024-04-01T10:00:00.000Z'
      },
      {
        id: '7',
        name: 'Lisinopril 10mg',
        category: 'Cardiovascular',
        stock: 90,
        minStock: 40,
        price: 6.25,
        expiryDate: '2025-10-15',
        supplier: 'CardioMed',
        batchNumber: 'CM2024001',
        description: 'ACE inhibitor for blood pressure',
        dosage: '10mg tablets',
        manufacturer: 'CardioMed Inc',
        createdAt: '2024-04-15T10:00:00.000Z',
        updatedAt: '2024-04-15T10:00:00.000Z'
      },
      {
        id: '8',
        name: 'Simvastatin 20mg',
        category: 'Cardiovascular',
        stock: 60,
        minStock: 30,
        price: 7.50,
        expiryDate: '2025-07-20',
        supplier: 'CardioMed',
        batchNumber: 'CM2024002',
        description: 'Cholesterol-lowering medication',
        dosage: '20mg tablets',
        manufacturer: 'CardioMed Inc',
        createdAt: '2024-05-01T10:00:00.000Z',
        updatedAt: '2024-05-01T10:00:00.000Z'
      }
    ];
    
    // Save sample data to database only (no localStorage)
    // Note: This should be replaced with proper tenant-based data creation
    
    // Try to save to Atlas database as well
    try {
      for (const medicine of sampleMedicines) {
        await db.createMedicine({
          ...medicine,
          pharmacyId: 'current_tenant'
        });
      }
    } catch (error) {
      console.log('Could not save to Atlas, using localStorage only');
    }
    
    return sampleMedicines;
  };

  const saveMedicines = async (medicineList: Medicine[]) => {
    // Save to database only (no localStorage)
    setMedicines(medicineList);
  };

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = auth.requireAuth();
      if (!currentUser) {
        return;
      }

      setUser(currentUser);
      const medicines = await loadMedicines();
      setMedicines(medicines);
      setLoading(false);
    };

    initializeData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N to add new medicine
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowAddModal(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowRestockModal(false);
        setSelectedMedicine(null);
      }
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // CRUD Operations
  const handleAddMedicine = async () => {
    if (!formData.name || !formData.category || !formData.supplier) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newMedicine = await db.createMedicine({
        ...formData,
        pharmacyId: 'current_tenant'
      });

      const updatedMedicines = [...medicines, newMedicine];
      await saveMedicines(updatedMedicines);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Error adding medicine. Please try again.');
    }
  };

  const handleEditMedicine = async () => {
    if (!selectedMedicine || !formData.name || !formData.category || !formData.supplier) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await db.updateMedicine(selectedMedicine.id, formData);

      const updatedMedicines = medicines.map(med => 
        med.id === selectedMedicine.id 
          ? { ...med, ...formData, updatedAt: new Date().toISOString() }
          : med
      );

      await saveMedicines(updatedMedicines);
      setShowEditModal(false);
      setSelectedMedicine(null);
      resetForm();
    } catch (error) {
      console.error('Error updating medicine:', error);
      alert('Error updating medicine. Please try again.');
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await db.deleteMedicine(medicineId);
        const updatedMedicines = medicines.filter(med => med.id !== medicineId);
        await saveMedicines(updatedMedicines);
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Error deleting medicine. Please try again.');
      }
    }
  };

  const handleRestockMedicine = async (restockAmount: number) => {
    if (!selectedMedicine || restockAmount <= 0) {
      alert('Please enter a valid restock amount');
      return;
    }

    try {
      const newStock = selectedMedicine.stock + restockAmount;
      await db.updateMedicine(selectedMedicine.id, { stock: newStock });

      const updatedMedicines = medicines.map(med => 
        med.id === selectedMedicine.id 
          ? { ...med, stock: newStock, updatedAt: new Date().toISOString() }
          : med
      );

      await saveMedicines(updatedMedicines);
      setShowRestockModal(false);
      setSelectedMedicine(null);
    } catch (error) {
      console.error('Error restocking medicine:', error);
      alert('Error restocking medicine. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      stock: 0,
      minStock: 0,
      price: 0,
      expiryDate: '',
      supplier: '',
      batchNumber: '',
      description: '',
      dosage: '',
      manufacturer: ''
    });
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      category: medicine.category,
      stock: medicine.stock,
      minStock: medicine.minStock,
      price: medicine.price,
      expiryDate: medicine.expiryDate,
      supplier: medicine.supplier,
      batchNumber: medicine.batchNumber,
      description: medicine.description || '',
      dosage: medicine.dosage || '',
      manufacturer: medicine.manufacturer || ''
    });
    setShowEditModal(true);
  };

  const openRestockModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowRestockModal(true);
  };

  const filteredAndSortedMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'expiry':
          aValue = new Date(a.expiryDate).getTime();
          bValue = new Date(b.expiryDate).getTime();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const categories = ['all', ...Array.from(new Set(medicines.map(m => m.category)))];
  const lowStockCount = medicines.filter(m => m.stock <= m.minStock).length;
  const expiringCount = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }).length;

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock) return 'low';
    if (stock <= minStock * 1.5) return 'medium';
    return 'good';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isExpiringSoon = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 90; // 3 months
  };

  const isExpired = (expiryDate: string) => {
    return getDaysUntilExpiry(expiryDate) <= 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">💊</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Inventory Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  db.isUsingAtlas() ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <span className="w-2 h-2 rounded-full mr-1 ${db.isUsingAtlas() ? 'bg-green-500' : 'bg-yellow-500'}"></span>
                  {db.isUsingAtlas() ? 'Atlas' : 'Local'}
                </div>
                <div className="absolute right-0 top-8 bg-black text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-48">
                  <div className="font-semibold mb-2">Database Status:</div>
                  <div>{db.isUsingAtlas() ? 'Connected to MongoDB Atlas' : 'Using localStorage fallback'}</div>
                </div>
              </div>
              <div className="relative group">
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                  ❓
                </button>
                <div className="absolute right-0 top-8 bg-black text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64">
                  <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
                  <div>Ctrl/Cmd + N: Add Medicine</div>
                  <div>Ctrl/Cmd + F: Focus Search</div>
                  <div>Escape: Close Modals</div>
                </div>
              </div>
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📦</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Items</div>
                <div className="text-2xl font-bold text-gray-900">{medicines.length}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Low Stock</div>
                <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-lg">⏰</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Expiring Soon</div>
                <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">💰</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Value</div>
                <div className="text-2xl font-bold text-green-600">
                  ${medicines.reduce((sum, m) => sum + (m.stock * m.price), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-lg">🏷️</span>
              </div>
              <div>
                <div className="text-sm text-gray-600">Categories</div>
                <div className="text-2xl font-bold text-purple-600">{categories.length - 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Medicines</label>
              <input
                type="text"
                placeholder="Search by name, category, supplier, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="stock">Stock Level</option>
                <option value="expiry">Expiry Date</option>
                <option value="price">Price</option>
              </select>
            </div>
            <div className="md:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  📋 Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🔲 Grid
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <span className="mr-2">+</span>
                Add Medicine
              </button>
              <button
                onClick={() => {
                  const csvContent = "data:text/csv;charset=utf-8," + 
                    "Name,Category,Stock,Min Stock,Price,Expiry Date,Supplier,Batch Number\n" +
                    medicines.map(m => `${m.name},${m.category},${m.stock},${m.minStock},${m.price},${m.expiryDate},${m.supplier},${m.batchNumber}`).join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "inventory.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📊 Export
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedMedicines.length} of {medicines.length} medicines
              </div>
              {lowStockCount > 0 && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  <span className="mr-1">⚠️</span>
                  {lowStockCount} low stock items
                </div>
              )}
              {expiringCount > 0 && (
                <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                  <span className="mr-1">⏰</span>
                  {expiringCount} expiring soon
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setSearchTerm('');
                  setSortBy('name');
                  setSortOrder('asc');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                🔄 Reset Filters
              </button>
              <button
                onClick={() => {
                  const lowStockItems = medicines.filter(m => m.stock <= m.minStock);
                  if (lowStockItems.length > 0) {
                    const message = `Low Stock Items:\n${lowStockItems.map(m => `• ${m.name}: ${m.stock} units (min: ${m.minStock})`).join('\n')}`;
                    alert(message);
                  } else {
                    alert('No low stock items found!');
                  }
                }}
                className="text-sm text-red-600 hover:text-red-900 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                📋 Low Stock Report
              </button>
              <button
                onClick={() => {
                  const expiringItems = medicines.filter(m => isExpiringSoon(m.expiryDate));
                  if (expiringItems.length > 0) {
                    const message = `Expiring Soon:\n${expiringItems.map(m => `• ${m.name}: ${new Date(m.expiryDate).toLocaleDateString()} (${getDaysUntilExpiry(m.expiryDate)} days)`).join('\n')}`;
                    alert(message);
                  } else {
                    alert('No items expiring soon!');
                  }
                }}
                className="text-sm text-yellow-600 hover:text-yellow-900 px-3 py-1 rounded-lg hover:bg-yellow-50 transition-colors"
              >
                ⏰ Expiry Report
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Medicine Inventory ({filteredAndSortedMedicines.length} items)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedMedicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.stock, medicine.minStock);
                    const isExpiringSoon = new Date(medicine.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    return (
                      <tr key={medicine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                            <div className="text-sm text-gray-500">
                              {medicine.dosage && `${medicine.dosage} • `}
                              Batch: {medicine.batchNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {medicine.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                              {medicine.stock} units
                            </span>
                            {stockStatus === 'low' && (
                              <span className="ml-2 text-red-500" title="Low Stock">⚠️</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Min: {medicine.minStock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${medicine.price.toFixed(2)}
                          <div className="text-xs text-gray-500">
                            Total: ${(medicine.stock * medicine.price).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {new Date(medicine.expiryDate).toLocaleDateString()}
                            {isExpiringSoon && (
                              <div className="text-xs text-red-500">Expiring Soon!</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medicine.supplier}
                          {medicine.manufacturer && (
                            <div className="text-xs text-gray-500">{medicine.manufacturer}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openEditModal(medicine)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit Medicine"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => openRestockModal(medicine)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Restock"
                            >
                              📦
                            </button>
                            <button 
                              onClick={() => handleDeleteMedicine(medicine.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete Medicine"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedMedicines.map((medicine) => {
              const stockStatus = getStockStatus(medicine.stock, medicine.minStock);
              const isExpiringSoon = new Date(medicine.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
              return (
                <div key={medicine.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{medicine.name}</h3>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {medicine.category}
                        </span>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {stockStatus === 'low' && (
                          <span className="text-red-500" title="Low Stock">⚠️</span>
                        )}
                        {isExpiringSoon && (
                          <span className="text-yellow-500" title="Expiring Soon">⏰</span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stock:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                          {medicine.stock} units
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="text-sm font-medium text-gray-900">${medicine.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Expiry:</span>
                        <span className={`text-sm ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Supplier:</span>
                        <span className="text-sm text-gray-900 truncate ml-2">{medicine.supplier}</span>
                      </div>

                      {medicine.dosage && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Dosage:</span>
                          <span className="text-sm text-gray-900">{medicine.dosage}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Batch:</span>
                        <span className="text-sm text-gray-900">{medicine.batchNumber}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {medicine.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{medicine.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Min: {medicine.minStock}
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditModal(medicine)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit Medicine"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => openRestockModal(medicine)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Restock"
                        >
                          📦
                        </button>
                        <button 
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Medicine"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedMedicines.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medicines found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first medicine to the inventory.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add First Medicine
            </button>
          </div>
        )}
      </main>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Medicine</h2>
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddMedicine(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Pain Relief">Pain Relief</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Digestive">Digestive</option>
                      <option value="Antihistamine">Antihistamine</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock *</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 500mg tablets"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of the medicine..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); resetForm(); }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Medicine</h2>
                <button
                  onClick={() => { setShowEditModal(false); setSelectedMedicine(null); resetForm(); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleEditMedicine(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Pain Relief">Pain Relief</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Digestive">Digestive</option>
                      <option value="Antihistamine">Antihistamine</option>
                      <option value="Diabetes">Diabetes</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Respiratory">Respiratory</option>
                      <option value="Vitamins">Vitamins</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stock *</label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 500mg tablets"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of the medicine..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setSelectedMedicine(null); resetForm(); }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Restock Medicine</h2>
                <button
                  onClick={() => { setShowRestockModal(false); setSelectedMedicine(null); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedMedicine.name}</h3>
                <p className="text-sm text-gray-600">Current Stock: {selectedMedicine.stock} units</p>
                <p className="text-sm text-gray-600">Minimum Stock: {selectedMedicine.minStock} units</p>
              </div>
              
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.target as HTMLFormElement);
                const amount = parseInt(formData.get('restockAmount') as string);
                handleRestockMedicine(amount);
              }}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restock Amount</label>
                  <input
                    type="number"
                    name="restockAmount"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity to add"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowRestockModal(false); setSelectedMedicine(null); }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Restock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}