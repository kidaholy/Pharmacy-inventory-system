'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User, db } from '../../lib/database-safe';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Download, Filter, Trash2, Edit, AlertCircle, RefreshCw } from "lucide-react";

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
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Form state
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

  // Load medicines logic
  const loadMedicines = async () => {
    try {
      const medicines = await db.getMedicinesByPharmacy('current_tenant');
      if (medicines && medicines.length > 0) {
        return medicines;
      }
    } catch (error) {
      console.log('Loading from localStorage fallback');
    }
    return [];
  };

  const saveMedicines = async (medicineList: Medicine[]) => {
    setMedicines(medicineList);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const currentUser = auth.requireAuth();
      if (!currentUser) return;

      setUser(currentUser);
      const fetchedMedicines = await loadMedicines();
      // If empty, we might want to ensure we're connected to something, but for now just empty state.
      setMedicines(fetchedMedicines || []);
      setLoading(false);
    };

    initializeData();
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
      console.error(error);
      alert('Error updating medicine');
    }
  };

  const handleDeleteMedicine = async (medicineId: string) => {
    if (confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await db.deleteMedicine(medicineId);
        const updatedMedicines = medicines.filter(med => med.id !== medicineId);
        await saveMedicines(updatedMedicines);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRestockMedicine = async () => {
    if (!selectedMedicine || restockAmount <= 0) return;
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
      setRestockAmount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', category: '', stock: 0, minStock: 0, price: 0,
      expiryDate: '', supplier: '', batchNumber: '', description: '',
      dosage: '', manufacturer: ''
    });
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name, category: medicine.category, stock: medicine.stock,
      minStock: medicine.minStock, price: medicine.price, expiryDate: medicine.expiryDate,
      supplier: medicine.supplier, batchNumber: medicine.batchNumber,
      description: medicine.description || '', dosage: medicine.dosage || '',
      manufacturer: medicine.manufacturer || ''
    });
    setShowEditModal(true);
  };

  const filteredAndSortedMedicines = medicines
    .filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === 'stock') return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      if (sortBy === 'price') return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
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

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-muted-foreground">Loading inventory...</div>
      </div>
    </DashboardLayout>
  );

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage your medicine stock, prices, and suppliers.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { }}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Medicine</DialogTitle>
                  <DialogDescription>Fill in the details to add a new medicine to inventory.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Paracetamol" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Pain Relief" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Min Stock Level</Label>
                    <Input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Input value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Batch Number</Label>
                    <Input value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button onClick={handleAddMedicine}>Save Medicine</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <div className="text-muted-foreground">📦</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{medicines.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <div className="text-red-500">⚠️</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <div className="text-yellow-500">⏰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <div className="text-green-500">💰</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${medicines.reduce((sum, m) => sum + (m.stock * m.price), 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search medicines..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No medicines found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">
                        <div>{medicine.name}</div>
                        <div className="text-xs text-muted-foreground">{medicine.dosage}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{medicine.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {medicine.stock}
                          {medicine.stock <= medicine.minStock && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${medicine.price.toFixed(2)}</TableCell>
                      <TableCell>{new Date(medicine.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{medicine.supplier}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => {
                                setSelectedMedicine(medicine);
                                setRestockAmount(0);
                              }}>
                                <RefreshCw className="h-4 w-4 text-blue-500" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Restock {medicine.name}</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <Label>Amount to add</Label>
                                <Input type="number" value={restockAmount} onChange={e => setRestockAmount(Number(e.target.value))} />
                              </div>
                              <DialogFooter>
                                <Button onClick={handleRestockMedicine}>Restock</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button variant="ghost" size="icon" onClick={() => openEditModal(medicine)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteMedicine(medicine.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal (Hidden initially) */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g. Pain Relief" />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Min Stock Level</Label>
              <Input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Batch Number</Label>
              <Input value={formData.batchNumber} onChange={e => setFormData({ ...formData, batchNumber: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleEditMedicine}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}