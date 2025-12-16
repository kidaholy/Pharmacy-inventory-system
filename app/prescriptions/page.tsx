'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User } from '../../lib/database';
import Link from 'next/link';

interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }[];
  issueDate: string;
  status: 'pending' | 'dispensed' | 'partial' | 'cancelled';
  totalAmount: number;
  notes?: string;
}

export default function PrescriptionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample prescription data
  const samplePrescriptions: Prescription[] = [
    {
      id: 'RX001',
      patientName: 'John Smith',
      patientId: 'P001',
      doctorName: 'Dr. Sarah Johnson',
      medicines: [
        {
          name: 'Amoxicillin 250mg',
          dosage: '250mg',
          quantity: 21,
          instructions: 'Take 1 capsule 3 times daily for 7 days'
        },
        {
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          quantity: 20,
          instructions: 'Take 1-2 tablets every 4-6 hours as needed'
        }
      ],
      issueDate: '2024-12-15',
      status: 'pending',
      totalAmount: 45.75,
      notes: 'Patient allergic to penicillin - confirmed amoxicillin is safe'
    },
    {
      id: 'RX002',
      patientName: 'Mary Davis',
      patientId: 'P002',
      doctorName: 'Dr. Michael Brown',
      medicines: [
        {
          name: 'Omeprazole 20mg',
          dosage: '20mg',
          quantity: 30,
          instructions: 'Take 1 capsule daily before breakfast'
        }
      ],
      issueDate: '2024-12-14',
      status: 'dispensed',
      totalAmount: 37.50
    },
    {
      id: 'RX003',
      patientName: 'Robert Wilson',
      patientId: 'P003',
      doctorName: 'Dr. Emily Chen',
      medicines: [
        {
          name: 'Ibuprofen 400mg',
          dosage: '400mg',
          quantity: 30,
          instructions: 'Take 1 tablet 3 times daily with food'
        },
        {
          name: 'Cetirizine 10mg',
          dosage: '10mg',
          quantity: 14,
          instructions: 'Take 1 tablet daily at bedtime'
        }
      ],
      issueDate: '2024-12-13',
      status: 'partial',
      totalAmount: 67.50,
      notes: 'Cetirizine out of stock - patient will collect later'
    },
    {
      id: 'RX004',
      patientName: 'Lisa Anderson',
      patientId: 'P004',
      doctorName: 'Dr. James Miller',
      medicines: [
        {
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          quantity: 16,
          instructions: 'Take 2 tablets every 6 hours for pain relief'
        }
      ],
      issueDate: '2024-12-12',
      status: 'dispensed',
      totalAmount: 8.00
    }
  ];

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setPrescriptions(samplePrescriptions);
    setLoading(false);
  }, []);

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.medicines.some(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'dispensed': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'dispensed': return '✅';
      case 'partial': return '🔄';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleStatusChange = (prescriptionId: string, newStatus: string) => {
    setPrescriptions(prev => 
      prev.map(p => p.id === prescriptionId ? { ...p, status: newStatus as any } : p)
    );
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
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">📋</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Prescription Management</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Prescriptions</div>
            <div className="text-2xl font-bold text-gray-900">{prescriptions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">
              {prescriptions.filter(p => p.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Dispensed Today</div>
            <div className="text-2xl font-bold text-green-600">
              {prescriptions.filter(p => p.status === 'dispensed' && p.issueDate === '2024-12-15').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-2xl font-bold text-blue-600">
              ${prescriptions.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Prescriptions</label>
              <input
                type="text"
                placeholder="Search by patient, doctor, prescription ID, or medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="dispensed">Dispensed</option>
                <option value="partial">Partial</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                + New Prescription
              </button>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getStatusIcon(prescription.status)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Prescription {prescription.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Issued on {new Date(prescription.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(prescription.status)}`}>
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${prescription.totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {prescription.patientName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Patient ID:</strong> {prescription.patientId}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prescribing Doctor</h4>
                    <p className="text-sm text-gray-600">{prescription.doctorName}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Prescribed Medicines</h4>
                  <div className="space-y-2">
                    {prescription.medicines.map((medicine, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{medicine.name}</p>
                            <p className="text-sm text-gray-600">{medicine.instructions}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm font-medium text-gray-900">Qty: {medicine.quantity}</p>
                            <p className="text-xs text-gray-500">{medicine.dosage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      {prescription.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  {prescription.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(prescription.id, 'partial')}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Mark Partial
                      </button>
                      <button
                        onClick={() => handleStatusChange(prescription.id, 'dispensed')}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark Dispensed
                      </button>
                    </>
                  )}
                  {prescription.status === 'partial' && (
                    <button
                      onClick={() => handleStatusChange(prescription.id, 'dispensed')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete Dispensing
                    </button>
                  )}
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                    Print
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No prescriptions have been added yet.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}