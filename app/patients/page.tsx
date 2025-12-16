'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/auth';
import { User } from '../../lib/database';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string[];
  registrationDate: string;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export default function PatientsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample patient data
  const samplePatients: Patient[] = [
    {
      id: 'P001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1985-03-15',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Smith - +1 (555) 987-6543',
      allergies: ['Penicillin', 'Shellfish'],
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      registrationDate: '2023-01-15',
      lastVisit: '2024-12-15',
      status: 'active'
    },
    {
      id: 'P002',
      name: 'Mary Davis',
      email: 'mary.davis@email.com',
      phone: '+1 (555) 234-5678',
      dateOfBirth: '1978-07-22',
      address: '456 Oak Ave, City, State 12345',
      emergencyContact: 'Robert Davis - +1 (555) 876-5432',
      allergies: ['Latex'],
      medicalHistory: ['Gastroesophageal Reflux Disease'],
      registrationDate: '2023-03-20',
      lastVisit: '2024-12-14',
      status: 'active'
    },
    {
      id: 'P003',
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1 (555) 345-6789',
      dateOfBirth: '1992-11-08',
      address: '789 Pine St, City, State 12345',
      emergencyContact: 'Sarah Wilson - +1 (555) 765-4321',
      allergies: [],
      medicalHistory: ['Seasonal Allergies'],
      registrationDate: '2023-06-10',
      lastVisit: '2024-12-13',
      status: 'active'
    },
    {
      id: 'P004',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      phone: '+1 (555) 456-7890',
      dateOfBirth: '1990-05-30',
      address: '321 Elm St, City, State 12345',
      emergencyContact: 'Mike Anderson - +1 (555) 654-3210',
      allergies: ['Aspirin'],
      medicalHistory: [],
      registrationDate: '2023-09-05',
      lastVisit: '2024-12-12',
      status: 'active'
    },
    {
      id: 'P005',
      name: 'David Brown',
      email: 'david.brown@email.com',
      phone: '+1 (555) 567-8901',
      dateOfBirth: '1965-12-03',
      address: '654 Maple Ave, City, State 12345',
      emergencyContact: 'Carol Brown - +1 (555) 543-2109',
      allergies: ['Sulfa drugs'],
      medicalHistory: ['Arthritis', 'High Cholesterol'],
      registrationDate: '2022-11-18',
      lastVisit: '2024-11-28',
      status: 'inactive'
    }
  ];

  useEffect(() => {
    const currentUser = auth.requireAuth();
    if (!currentUser) {
      return;
    }

    setUser(currentUser);
    setPatients(samplePatients);
    setLoading(false);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
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
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">👥</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Patient Management</h1>
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
            <div className="text-sm text-gray-600">Total Patients</div>
            <div className="text-2xl font-bold text-gray-900">{patients.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active Patients</div>
            <div className="text-2xl font-bold text-green-600">
              {patients.filter(p => p.status === 'active').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">New This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {patients.filter(p => new Date(p.registrationDate).getMonth() === new Date().getMonth()).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">With Allergies</div>
            <div className="text-2xl font-bold text-yellow-600">
              {patients.filter(p => p.allergies.length > 0).length}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Patients</label>
              <input
                type="text"
                placeholder="Search by name, email, phone, or patient ID..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                + Add Patient
              </button>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">ID: {patient.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                    {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Age</p>
                      <p className="text-sm font-medium text-gray-900">{getAge(patient.dateOfBirth)} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Last Visit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(patient.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Contact</p>
                    <p className="text-sm text-gray-900">{patient.email}</p>
                    <p className="text-sm text-gray-900">{patient.phone}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                    <p className="text-sm text-gray-900">{patient.address}</p>
                  </div>

                  {patient.allergies.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Allergies</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.medicalHistory.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Medical History</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.medicalHistory.map((condition, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                    View History
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                    New Prescription
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No patients have been registered yet.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}